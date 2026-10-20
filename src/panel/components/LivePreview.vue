<script lang="ts">
import type { LicenseStatus } from "@kirby-tools/licensing";
import type { DevicePreset, SectionResponse } from "../types";
import { LicensingButtonGroup } from "@kirby-tools/licensing/components";
import {
  computed,
  isKirby5,
  nextTick,
  onBeforeUnmount,
  ref,
  useApi,
  useContent,
  useHelpers,
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

// eslint-disable-next-line regexp/no-super-linear-backtracking
const PATH_PARAMS_REGEX = /\/[^/]+?:.+$/;

export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
const props = defineProps(propsDefinition);

const _isKirby5 = isKirby5();
const panel = usePanel();
const api = useApi();
const helpers = useHelpers();
const { t } = useI18n();
const { getNonLocalizedPath } = useLocale();

interface RenderOptions {
  persistScrollPosition?: boolean;
}

const DEVICE_VIEWPORT_PRESETS: Record<DevicePreset, number> = {
  mobile: 390,
  tablet: 768,
  desktop: 1440,
};
const DEVICE_PRESETS = Object.keys(DEVICE_VIEWPORT_PRESETS) as DevicePreset[];

// #region Section props
const label = ref<string>();
const pageId = ref<string>();
const updateInterval = ref<SectionResponse["updateInterval"]>();
const interactable = ref<boolean>();
const aspectRatio = ref<string>();
const updateStrategy = ref<SectionResponse["updateStrategy"]>();

const help = ref<string | null>();
// #endregion

// #region Runtime state
const isRendering = ref(false);
const showTransitionIframe = ref(false);
const hasError = ref(false);
const blobUrl = ref<string>();
const transitionBlobUrl = ref<string>();
const devicePreview = ref<DevicePreset>();
const isInsetDevicePreview = ref(false);
const previewIframeStyles = ref<Record<string, string | number>>({});
const licenseStatus = ref<LicenseStatus>();

const container = ref<HTMLElement>();
const iframe = ref<HTMLIFrameElement>();
const transitionIframe = ref<HTMLIFrameElement>();

let throttledRenderPreview: typeof renderPreview | undefined;
let lastRenderedContent: string | undefined;
const eventsController = new AbortController();
// #endregion

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
  // Will be `null` in single-language setups.
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
        ? // Subtract the topbar's bottom margin.
          `calc(${topbarHeight.value}px + 5.75rem)`
        : // Sticky columns have applied `top: calc(var(--header-sticky-offset) + 2vh)`.
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
    }) as Promise<SectionResponse>,
  ]);

  label.value = t(response.label) || panel.t("johannschopplich.preview.label");
  pageId.value = response.pageId;
  updateInterval.value = response.updateInterval;
  interactable.value = response.interactable;
  aspectRatio.value = response.aspectRatio || undefined;
  updateStrategy.value = response.updateStrategy;
  help.value = response.help;
  licenseStatus.value = __PLAYGROUND__ ? "active" : context.licenseStatus;

  // The update interval can be `false`, so fall back to the default of 500 ms.
  throttledRenderPreview = throttle(renderPreview, updateInterval.value || 500);

  renderUnsavedContent();

  // Equals the `mounted` lifecycle hook.
  await nextTick();

  const topbar = document.querySelector<HTMLElement>(".k-topbar");
  const header = document.querySelector<HTMLElement>(".k-header");

  if (!aspectRatio.value && topbar && header) {
    topbarHeight.value = topbar.offsetHeight;
    headerHeight.value = header.offsetHeight;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        isTopbarVisible.value = entry.isIntersecting;
        if (entry.isIntersecting) {
          topbarHeight.value = (entry.target as HTMLElement).offsetHeight;
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

// Keep these synchronous – an unmount before the async setup resolves would
// run `off` first, which mitt silently ignores.
panel.events.on("page.changeTitle", renderUnsavedContent);
panel.events.on("file.sort", renderUnsavedContent);

onBeforeUnmount(() => {
  eventsController.abort();

  panel.events.off("page.changeTitle", renderUnsavedContent);
  panel.events.off("file.sort", renderUnsavedContent);

  if (blobUrl.value) {
    URL.revokeObjectURL(blobUrl.value);
  }
});

function renderUnsavedContent(options?: RenderOptions) {
  throttledRenderPreview?.(contentChanges.value, options);
}

function openPreviewInTab() {
  if (!blobUrl.value) return;
  const url = new URL(blobUrl.value);
  window.open(url, "_blank");
}

function setDevicePreview(device: DevicePreset) {
  devicePreview.value = device === devicePreview.value ? undefined : device;
  updatePreviewStyles();
}

async function updatePreviewStyles() {
  // Wait for the container to have the updated size.
  await nextTick();

  if (!container.value || !devicePreview.value) {
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
    // Offset by half the width to center the device viewport.
    marginLeft: `${-deviceWidth / 2}px`,
  };
}

async function renderPreview(
  content: Record<string, unknown>,
  { persistScrollPosition = true }: RenderOptions = {},
) {
  if (isRendering.value) return;
  isRendering.value = true;

  let scrollPosition = 0;

  if (iframe.value) {
    scrollPosition = iframe.value.contentWindow?.scrollY ?? 0;
    transitionIframe.value?.contentWindow?.scrollTo(0, scrollPosition);
  }

  showTransitionIframe.value = true;

  try {
    const { data: html } = await api.post<{ data: string }>(
      "__live-preview__/render",
      {
        pageId: pageId.value,
        content,
        interactable: interactable.value,
        parent: props.parent,
      },
    );

    const lastBlobUrl = blobUrl.value;
    const blob = new Blob([html], { type: "text/html" });
    blobUrl.value = URL.createObjectURL(blob);

    // Wait for the iframe to render.
    await nextTick();
    await new Promise<void>((resolve) => {
      iframe.value!.addEventListener(
        "load",
        () => {
          if (scrollPosition && persistScrollPosition) {
            iframe.value!.contentWindow?.scrollTo(0, scrollPosition);
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

async function handleMessage({ data, source }: MessageEvent) {
  // Only the preview frames may save or navigate the Panel
  if (
    source !== iframe.value?.contentWindow &&
    source !== transitionIframe.value?.contentWindow
  ) {
    return;
  }

  if (data.type === "save") {
    panel.events.emit(`${panel.context}.save`);
    return;
  }

  if (data.type === "link") {
    const url = new URL(data.href);

    if (helpers.url.hasDangerousScheme(data.href)) {
      return;
    }

    if (url.origin !== window.location.origin) {
      window.open(data.href, "_blank", "noopener");
      return;
    }

    if (
      ["assets", "media"].some((path) => url.pathname.startsWith(`/${path}/`))
    ) {
      return;
    }

    let path = getNonLocalizedPath(url).slice(1);

    if (path) {
      // Strip Kirby path parameters, like the `tag:sky` in `notes/tag:sky`.
      path = path.replace(PATH_PARAMS_REGEX, "");
      path = joinURL("pages", path.replaceAll("/", "+"));
    } else {
      path = "site";
    }

    // Custom implementation of `panel.open` to avoid error notifications.
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

function uppercaseFirst(string: string) {
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
        pricing-url="https://kirby.tools/live-preview/buy"
      />

      <k-button-group layout="collapsed">
        <k-button
          v-for="device in DEVICE_PRESETS"
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
          'klp-[box-shadow:var(--shadow-md)]',
        (!transitionBlobUrl || hasError) &&
          'klp-border klp-border-dashed klp-border-[var(--preview-color-border)]',
        // Allow for the overflow shadow of an inset device preview.
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
            'klp-[box-shadow:var(--shadow-md)]',
        ]"
        :style="{
          gridArea: '1 / 1 / 2 / 2',
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
            'klp-[box-shadow:var(--shadow-md)]',
        ]"
        :style="{
          gridArea: '1 / 1 / 2 / 2',
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
          gridArea: '1 / 1 / 2 / 2',
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

    <footer v-if="help" class="klp-mt-[var(--spacing-2)]">
      <k-text class="k-help" :html="help" />
    </footer>
  </k-section>
</template>
