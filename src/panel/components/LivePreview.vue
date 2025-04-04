<script>
import { LicensingButtonGroup } from "@kirby-tools/licensing/components";
import {
  computed,
  isKirby5,
  nextTick,
  onBeforeUnmount,
  ref,
  useApi,
  useContent,
  useI18n,
  usePanel,
  useSection,
  watch,
} from "kirbyuse";
import { section } from "kirbyuse/props";
import throttle from "throttleit";
import { joinURL, withLeadingSlash } from "ufo";
import { useLocale, usePluginContext } from "../composables";

const propsDefinition = {
  ...section,
};

export default {
  inheritAttrs: false,
};
</script>

<script setup>
const props = defineProps(propsDefinition);

const _isKirby5 = isKirby5();
const panel = usePanel();
const api = useApi();
const { t } = useI18n();
const { getNonLocalizedPath } = useLocale();

const DEVICE_VIEWPORT_PRESETS = {
  mobile: 390,
  tablet: 768,
  desktop: 1440,
};

// Section props
const label = ref();
const pageId = ref();
const updateInterval = ref();
const interactable = ref();
const aspectRatio = ref();
const updateStrategy = ref();

// Section computed
const help = ref();

// Runtime state
const isRendering = ref(false);
const showTransitionIframe = ref(false);
const hasError = ref(false);
const blobUrl = ref();
const transitionBlobUrl = ref();
const devicePreview = ref();
const isInsetDevicePreview = ref(false);
const previewIframeStyles = ref({});
const licenseStatus = ref();

// Element refs
const container = ref();
const iframe = ref();
const transitionIframe = ref();

// Non-reactive data
let throttledRenderPreview;
let lastRenderedContent;
const eventsController = new AbortController();

const { contentChanges } = useContent();

watch(contentChanges, (newValue) => {
  if (
    throttledRenderPreview &&
    updateInterval.value !== false &&
    updateStrategy.value === "interval" &&
    JSON.stringify(newValue) !== lastRenderedContent
  ) {
    throttledRenderPreview(newValue);
  }
});

watch(
  // Will be `null` in single language setups
  () => panel.language.code,
  () => {
    renderUnsavedContent();
  },
);

const isTopbarVisible = ref(true);
const topbarHeight = ref(32);
const headerHeight = ref(65);

const containerHeight = computed(
  () =>
    `calc(100dvh - ${
      isTopbarVisible.value
        ? // Substract topbar bottom margin
          `calc(${topbarHeight.value}px + 5.75rem)`
        : // Sticky columns have applied `top: calc(var(--header-sticky-offset) + 2vh)`
          "2vh"
    } - ${headerHeight.value}px - 2.75rem`,
);

(async () => {
  const { load } = useSection();
  const [context, response] = await Promise.all([
    usePluginContext(),
    load({
      parent: props.parent,
      name: props.name,
    }),
  ]);

  label.value = t(response.label) || panel.t("johannschopplich.preview.label");
  pageId.value = response.pageId;
  updateInterval.value = response.updateInterval;
  interactable.value = response.interactable;
  aspectRatio.value = response.aspectRatio || undefined;
  updateStrategy.value = response.updateStrategy;
  help.value = response.help;
  licenseStatus.value =
    // eslint-disable-next-line no-undef
    __PLAYGROUND__ ? "active" : context.licenseStatus;

  // Update interval can be `false`, so we use the default value of `500`
  throttledRenderPreview = throttle(renderPreview, updateInterval.value || 500);

  // Lazily render the preview
  renderUnsavedContent();

  // Equals the `mounted` lifecycle hook
  await nextTick();

  const topbar = document.querySelector(".k-topbar");
  const header = document.querySelector(".k-header");

  if (!aspectRatio.value && topbar && header) {
    topbarHeight.value = topbar.offsetHeight;
    headerHeight.value = header.offsetHeight;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isTopbarVisible.value = entry.isIntersecting;
        if (entry.isIntersecting) {
          topbarHeight.value = entry.target.offsetHeight;
        }
        updatePreviewStyles();
      },
      {
        threshold: [0],
        rootMargin: "64px 0px 0px 0px",
      },
    );

    observer.observe(topbar);
    onBeforeUnmount(observer.disconnect);
  }

  window.addEventListener("message", handleMessage, {
    signal: eventsController.signal,
  });
  panel.events.on("page.changeTitle", renderUnsavedContent);
  panel.events.on("file.sort", renderUnsavedContent);

  if (updateStrategy.value === "blur") {
    document.body.addEventListener(
      "blur",
      () => {
        if (JSON.stringify(contentChanges.value) !== lastRenderedContent) {
          throttledRenderPreview?.(contentChanges.value);
        }
      },
      { capture: true, signal: eventsController.signal },
    );
  }
})();

onBeforeUnmount(() => {
  eventsController.abort();

  panel.events.off("page.changeTitle", renderUnsavedContent);
  panel.events.off("file.sort", renderUnsavedContent);

  if (blobUrl.value) {
    URL.revokeObjectURL(blobUrl.value);
  }
});

function renderUnsavedContent(options) {
  throttledRenderPreview?.(contentChanges.value, options);
}

function openPreviewInTab() {
  const url = new URL(blobUrl.value);
  window.open(url, "_blank");
}

function setDevicePreview(device) {
  devicePreview.value = device === devicePreview.value ? undefined : device;
  updatePreviewStyles();
}

async function updatePreviewStyles() {
  // Wait for container to have the updated size
  await nextTick();

  if (
    !container.value ||
    !devicePreview.value ||
    !(devicePreview.value in DEVICE_VIEWPORT_PRESETS)
  ) {
    isInsetDevicePreview.value = false;
    return;
  }

  const deviceWidth = DEVICE_VIEWPORT_PRESETS[devicePreview.value];
  const containerWidth = container.value.clientWidth;
  const containerHeight = container.value.clientHeight;
  const scale = containerWidth / deviceWidth;

  isInsetDevicePreview.value = deviceWidth < containerWidth;

  previewIframeStyles.value = {
    width: `${deviceWidth}px`,
    height: scale < 1 ? `${containerHeight / scale}px` : "100%",
    transform: scale < 1 ? `scale(${scale})` : "none",
    transformOrigin: "top center",
    position: "absolute",
    top: 0,
    left: "50%",
    // Offset by half the width for perfect centering
    marginLeft: `${-deviceWidth / 2}px`,
  };
}

async function renderPreview(content, { persistScrollPosition = true } = {}) {
  if (isRendering.value) return;
  isRendering.value = true;

  let scrollPosition = 0;

  if (iframe.value) {
    scrollPosition = iframe.value.contentWindow.scrollY;
    // Set scroll position on transition iframe
    transitionIframe.value?.contentWindow?.scrollTo(0, scrollPosition);
  }

  showTransitionIframe.value = true;

  try {
    const { data: html } = await api.post("__live-preview__/render", {
      pageId: pageId.value,
      content,
      interactable: interactable.value,
      model: panel.view.path === "site" ? "site" : "page",
    });

    const lastBlobUrl = blobUrl.value;
    const blob = new Blob([html], { type: "text/html" });
    blobUrl.value = URL.createObjectURL(blob);

    // Wait for the iframe to render
    await nextTick();
    await new Promise((resolve) => {
      iframe.value.addEventListener(
        "load",
        () => {
          // Restore scroll position
          if (scrollPosition && persistScrollPosition) {
            iframe.value.contentWindow.scrollTo(0, scrollPosition);
          }
          resolve();
        },
        { once: true },
      );
    });

    showTransitionIframe.value = false;
    hasError.value = false;
    transitionBlobUrl.value = blobUrl.value;
    lastRenderedContent = JSON.stringify(content);

    // Revoke the previous blob URL to free up memory
    if (lastBlobUrl) {
      URL.revokeObjectURL(lastBlobUrl);
    }
  } catch (error) {
    console.error(error);
    hasError.value = true;
    showTransitionIframe.value = false;
  } finally {
    isRendering.value = false;
  }
}

async function handleMessage({ data }) {
  if (data.type === "save") {
    panel.events.emit(`${panel.context}.save`);
    return;
  }

  if (data.type === "link") {
    const url = new URL(data.href);

    if (url.origin !== window.location.origin) {
      window.open(data.href, "_blank");
      return;
    }

    if (
      ["assets", "media"].some((path) => url.pathname.startsWith(`/${path}/`))
    ) {
      return;
    }

    let path = getNonLocalizedPath(url).slice(1);

    if (path) {
      // Replace Kirby path parameters, like `notes/tag:sky`
      // eslint-disable-next-line regexp/no-super-linear-backtracking
      path = path.replace(/\/[^/]+?:.+$/, "");
      path = joinURL("pages", path.replaceAll("/", "+"));
    } else {
      path = "site";
    }

    // Custom implementation of `panel.open` to avoid error notifications
    try {
      panel.isLoading = true;
      const state = await panel.get(withLeadingSlash(path));
      panel.set(state);
      panel.isLoading = false;
    } catch (error) {
      console.error(error);
    }
  }
}

function uppercaseFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
</script>

<template>
  <k-section :label="label">
    <div slot="options" class="klp-flex klp-items-center klp-gap-2">
      <LicensingButtonGroup
        v-if="licenseStatus !== undefined"
        label="Kirby Live Preview"
        api-namespace="__live-preview__"
        :license-status="licenseStatus"
        pricing-url="https://kirby.tools/live-preview#pricing"
      />

      <k-button-group layout="collapsed">
        <k-button
          v-for="device in Object.keys(DEVICE_VIEWPORT_PRESETS)"
          :key="device"
          variant="filled"
          :theme="devicePreview === device ? 'blue' : undefined"
          size="xs"
          :title="uppercaseFirst(device)"
          :icon="
            device === 'mobile'
              ? 'mobile'
              : device === 'tablet'
                ? 'tablet'
                : 'display'
          "
          :style="{
            paddingInline: 'calc(var(--input-padding)*2)',
          }"
          @click="setDevicePreview(device)"
        />
      </k-button-group>

      <k-button
        variant="filled"
        size="xs"
        icon="open"
        :title="panel.t('open')"
        :disabled="!blobUrl"
        @click="openPreviewInTab()"
      />
      <k-button
        variant="filled"
        size="xs"
        icon="live-preview-restart"
        @click="renderUnsavedContent()"
      />
    </div>

    <div
      ref="container"
      class="klp-grid klp-min-h-[55dvh] klp-rounded-[var(--input-rounded)]"
      :class="[
        isRendering && 'klp-pointer-events-none',
        transitionBlobUrl &&
          !hasError &&
          !isInsetDevicePreview &&
          'k-shadow-md',
        (!transitionBlobUrl || hasError) &&
          'klp-border klp-border-dashed klp-border-[var(--preview-color-border)]',
        // Allow for overflow shadow for inset device preview
        devicePreview && 'klp-relative klp-overflow-visible',
      ]"
      :style="{
        '--preview-color-border': _isKirby5
          ? 'light-dark(var(--color-gray-400),var(--color-border))'
          : 'var(--color-gray-400)',
        aspectRatio,
        height: aspectRatio ? 'auto' : containerHeight,
        maxWidth: '100%',
      }"
      data-theme="passive"
    >
      <iframe
        v-if="transitionBlobUrl"
        ref="transitionIframe"
        :src="transitionBlobUrl"
        class="klp-rounded-[var(--input-rounded)] klp-bg-[var(--input-color-back)]"
        :class="[
          hasError && 'klp-pointer-events-none klp-opacity-0',
          showTransitionIframe &&
            !hasError &&
            isInsetDevicePreview &&
            'k-shadow-md',
        ]"
        :style="{
          gridArea: '1 / 1 / 1 / 1',
          ...(devicePreview
            ? previewIframeStyles
            : {
                width: '100%',
                height: '100%',
                transform: 'none',
              }),
        }"
      />
      <iframe
        v-if="blobUrl"
        ref="iframe"
        :src="blobUrl"
        class="klp-rounded-[var(--input-rounded)] klp-bg-[var(--input-color-back)]"
        :class="[
          (showTransitionIframe || hasError) &&
            'klp-pointer-events-none klp-opacity-0',
          !showTransitionIframe &&
            !hasError &&
            isInsetDevicePreview &&
            'k-shadow-md',
        ]"
        :style="{
          gridArea: '1 / 1 / 1 / 1',
          ...(devicePreview
            ? previewIframeStyles
            : {
                width: '100%',
                height: '100%',
                transform: 'none',
              }),
        }"
      />
      <div
        v-if="hasError"
        class="klp-flex klp-items-center klp-justify-center"
        :style="{
          gridArea: '1 / 1 / 1 / 1',
        }"
      >
        <k-button
          variant="filled"
          theme="notice"
          icon="alert"
          :text="panel.t('johannschopplich.preview.error.render')"
          @click="
            renderUnsavedContent({
              persistScrollPosition: false,
            })
          "
        />
      </div>
    </div>

    <k-text v-if="help" class="k-help klp-mt-2" :html="help" />
  </k-section>
</template>

<style scoped>
/* Required since Tailwind doesn't support shadow
   as arbitrary value (interpreted as color) */
.k-shadow-md {
  box-shadow: var(--shadow-md);
}
</style>
