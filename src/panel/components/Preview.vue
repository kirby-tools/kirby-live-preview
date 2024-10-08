<script>
import { useLicense } from "@kirby-tools/licensing";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  useApi,
  usePanel,
  useSection,
  useStore,
  watch,
} from "kirbyuse";
import { section } from "kirbyuse/props";
import throttle from "throttleit";
import { joinURL, withLeadingSlash } from "ufo";
import { useLocale } from "../composables";
import { LOG_LEVELS } from "../constants";

const propsDefinition = {
  ...section,
};

export default {
  inheritAttrs: false,
};
</script>

<script setup>
const props = defineProps(propsDefinition);

const panel = usePanel();
const api = useApi();
const store = useStore();
const { getNonLocalizedPath } = useLocale();
const { openLicenseModal, assertActivationIntegrity } = useLicense({
  label: "Kirby Live Preview",
  apiNamespace: "__live-preview__",
});

// Section props
const label = ref();
const updateInterval = ref();
const interactable = ref();
const aspectRatio = ref();
const logLevel = ref();
// Section computed
const help = ref();
const license = ref();
// Local data
const isRendering = ref(false);
const showTransitionIframe = ref(false);
const hasError = ref(false);
const blobUrl = ref();
const transitionBlobUrl = ref();
const containerRect = ref({});
// Element refs
const container = ref();
const iframe = ref();
const transitionIframe = ref();
const licenseButtonGroup = ref();

// Non-reactive data
// let storageKey;
let throttledRenderPreview;

const unsavedContent = computed(() => store.getters["content/changes"]());

watch(
  unsavedContent,
  (newValue, oldValue) => {
    if (
      throttledRenderPreview &&
      updateInterval.value !== false &&
      JSON.stringify(newValue) !== JSON.stringify(oldValue)
    ) {
      throttledRenderPreview(newValue);
    }
  },
  { deep: true },
);

watch(
  // Will be `null` in single language setups
  () => panel.language.code,
  () => {
    renderUnsavedContent();
  },
);

(async () => {
  const { load } = useSection();
  const response = await load({
    parent: props.parent,
    name: props.name,
  });
  label.value = t(response.label) || panel.t("johannschopplich.preview.label");
  updateInterval.value = response.updateInterval;
  interactable.value = response.interactable;
  aspectRatio.value = response.aspectRatio || undefined;
  logLevel.value = LOG_LEVELS.indexOf(response.logLevel);
  help.value = response.help;
  license.value =
    // eslint-disable-next-line no-undef
    __PLAYGROUND__ && window.location.hostname === "play.kirby.tools"
      ? "active"
      : response.license;
  // storageKey = getHashedStorageKey(panel.view.path);
  assertActivationIntegrity({
    component: licenseButtonGroup,
    licenseStatus: license.value,
  });

  // Update interval can be `false`, so we use the default value of `250`
  throttledRenderPreview = throttle(renderPreview, updateInterval.value || 250);

  // Lazily render the preview
  renderUnsavedContent();

  // Equals the `mounted` lifecycle hook
  await nextTick();

  if (!aspectRatio.value) {
    updateSectionHeight();
    window.addEventListener("resize", updateSectionHeight);
  }

  window.addEventListener("message", handleMessage);
  panel.events.on("page.changeTitle", renderUnsavedContent);
  panel.events.on("file.sort", renderUnsavedContent);
})();

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateSectionHeight);
  window.removeEventListener("message", handleMessage);
  panel.events.off("page.changeTitle", renderUnsavedContent);
  panel.events.off("file.sort", renderUnsavedContent);

  if (blobUrl.value) {
    URL.revokeObjectURL(blobUrl.value);
  }
});

function updateSectionHeight() {
  containerRect.value = container.value.getBoundingClientRect();
}

function renderUnsavedContent(options) {
  throttledRenderPreview?.(unsavedContent.value, options);
}

async function renderPreview(content, { persistScrollPosition = true } = {}) {
  if (isRendering.value) return;
  isRendering.value = true;

  const id = panel.view.path.startsWith("pages/")
    ? panel.view.path.slice(6).replaceAll("+", "/")
    : undefined;
  let scrollPosition = 0;

  if (iframe.value) {
    scrollPosition = iframe.value.contentWindow.scrollY;
    // Set scroll position on transition iframe
    transitionIframe.value?.contentWindow?.scrollTo(0, scrollPosition);
  }

  showTransitionIframe.value = true;

  try {
    const { html } = await api.post("__live-preview__/render", {
      id,
      content,
      interactable: interactable.value,
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

function t(value) {
  if (!value || typeof value === "string") return value;
  return value[panel.translation.code] ?? Object.values(value)[0];
}

async function handleRegistration() {
  const { isRegistered } = await openLicenseModal();
  if (isRegistered) {
    license.value = "active";
  }
}
</script>

<template>
  <k-section :label="label">
    <k-button-group slot="options">
      <k-button-group
        v-if="license && license !== 'active'"
        ref="licenseButtonGroup"
        layout="collapsed"
      >
        <k-button
          theme="love"
          variant="filled"
          size="xs"
          link="https://kirby.tools/live-preview#pricing"
          target="_blank"
          :text="panel.t('johannschopplich.preview.license.buy')"
        />
        <k-button
          theme="love"
          variant="filled"
          size="xs"
          icon="key"
          :text="panel.t('johannschopplich.preview.license.activate')"
          @click="handleRegistration()"
        />
      </k-button-group>
      <k-button
        variant="filled"
        size="xs"
        icon="live-preview-restart"
        @click="renderUnsavedContent()"
      />
    </k-button-group>

    <div
      ref="container"
      class="klp-grid klp-min-h-[55dvh] klp-rounded-[var(--input-rounded)]"
      :class="[
        isRendering && 'klp-pointer-events-none',
        transitionBlobUrl && !hasError && 'k-shadow-md',
        (!transitionBlobUrl || hasError) &&
          'klp-border klp-border-dashed klp-border-[var(--color-gray-400)]',
      ]"
      :style="{
        aspectRatio,
        height: aspectRatio
          ? 'auto'
          : `calc(100dvh - ${containerRect.top ?? 0}px - var(--spacing-3))`,
        maxWidth: '100%',
      }"
      data-theme="passive"
    >
      <iframe
        v-if="transitionBlobUrl"
        ref="transitionIframe"
        :src="transitionBlobUrl"
        class="klp-h-full klp-w-full klp-rounded-[var(--input-rounded)] klp-bg-white"
        :class="[hasError && 'klp-pointer-events-none klp-opacity-0']"
        :style="{
          gridArea: '1 / 1 / 1 / 1',
        }"
      />
      <iframe
        v-if="blobUrl"
        ref="iframe"
        :src="blobUrl"
        class="klp-h-full klp-w-full klp-rounded-[var(--input-rounded)] klp-bg-white"
        :class="[
          (showTransitionIframe || hasError) &&
            'klp-pointer-events-none klp-opacity-0',
        ]"
        :style="{
          gridArea: '1 / 1 / 1 / 1',
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
.k-shadow-md {
  box-shadow: var(--shadow-md);
}
</style>
