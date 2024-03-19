<script>
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
import throttle from "throttleit";
import { joinURL, withLeadingSlash } from "ufo";
import { section } from "kirbyuse/props";
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

// Section props
const label = ref();
const pointerEvents = ref();
const aspectRatio = ref();
const help = ref();
const logLevel = ref();
// Local data
const isRendering = ref(false);
const hasError = ref(false);
const blobUrl = ref();
const transitionBlobUrl = ref();
const containerRect = ref({});
const container = ref();
const iframe = ref();
const transitionIframe = ref();

// Non-reactive data
// let storageKey;

const unsavedContent = computed(() => store.getters["content/changes"]());

const throttledRenderPreview = throttle(renderPreview, 250);
watch(
  unsavedContent,
  (newValue, oldValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
      throttledRenderPreview(newValue);
    }
  },
  { deep: true },
);

(async () => {
  const { load } = useSection();
  const response = await load({
    parent: props.parent,
    name: props.name,
  });
  label.value = t(response.label) || panel.t("johannschopplich.preview.label");
  pointerEvents.value = response.pointerEvents;
  aspectRatio.value = response.aspectRatio || undefined;
  help.value = response.help;
  logLevel.value = LOG_LEVELS.indexOf(response.logLevel);
  // storageKey = getHashedStorageKey(panel.view.path);

  // Lazily load the preview
  renderPreview(unsavedContent.value);

  // Equals the `mounted` lifecycle hook
  await nextTick();

  if (!aspectRatio.value) {
    updateSectionHeight();
    window.addEventListener("resize", updateSectionHeight);
  }

  window.addEventListener("message", handleMessage);
})();

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateSectionHeight);
  window.removeEventListener("message", handleMessage);

  if (blobUrl.value) {
    URL.revokeObjectURL(blobUrl.value);
  }
});

async function renderPreview(content, { persistScrollPosition = true } = {}) {
  const id = panel.view.path.startsWith("pages/")
    ? panel.view.path.slice(6).replace(/\+/g, "/")
    : undefined;
  let scrollPosition = 0;

  if (iframe.value) {
    scrollPosition = iframe.value.contentWindow.scrollY;
    // Set scroll position on transition iframe
    transitionIframe.value?.contentWindow?.scrollTo(0, scrollPosition);
  }

  isRendering.value = true;

  try {
    const { result } = await api.post("__live-preview__/render", {
      id,
      content,
      pointerEvents: pointerEvents.value,
      language: panel.language.code,
    });

    const lastBlobUrl = blobUrl.value;
    const blob = new Blob([result.html], { type: "text/html" });
    blobUrl.value = URL.createObjectURL(blob);

    // Restore scroll position
    if (scrollPosition && persistScrollPosition) {
      await nextTick();
      await new Promise((resolve) => {
        iframe.value.addEventListener(
          "load",
          () => {
            iframe.value.contentWindow.scrollTo(0, scrollPosition);
            resolve();
          },
          { once: true },
        );
      });
    }

    // Wait just a bit to let images load
    await new Promise((resolve) => setTimeout(resolve, 50));

    isRendering.value = false;
    hasError.value = false;
    transitionBlobUrl.value = blobUrl.value;

    // Revoke the previous blob URL to free up memory
    if (lastBlobUrl) {
      URL.revokeObjectURL(lastBlobUrl);
    }
  } catch (error) {
    console.error(error);
    hasError.value = true;
    isRendering.value = false;
  }
}

function t(value) {
  if (!value || typeof value === "string") return value;
  return value[panel.translation.code] ?? Object.values(value)[0];
}

function updateSectionHeight() {
  containerRect.value = container.value.getBoundingClientRect();
}

async function handleMessage({ data }) {
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

    let path = url.pathname.slice(1);

    if (path) {
      // Replace Kirby path parameters, like `notes/tag:sky`
      path = path.replace(/\/[^\/]+?:.+$/, "");
      path = joinURL("pages", path.replace(/\//g, "+"));
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
</script>

<template>
  <k-section :label="label">
    <k-button-group slot="options" layout="collapsed">
      <k-button
        variant="filled"
        size="xs"
        icon="live-preview-restart"
        @click="
          throttledRenderPreview(unsavedContent, {
            persistScrollPosition: false,
          })
        "
      />
    </k-button-group>

    <!-- klp-border klp-border-dashed klp-border-[var(--color-gray-300)] -->
    <div
      ref="container"
      class="klp-grid klp-min-h-[50dvh] klp-rounded-[var(--input-rounded)]"
      :class="[
        isRendering && 'klp-pointer-events-none',
        blobUrl && !hasError && 'k-shadow-md',
      ]"
      :style="{
        aspectRatio,
        height: aspectRatio
          ? 'auto'
          : `calc(100dvh - ${containerRect.top ?? 0}px - var(--spacing-3))`,
      }"
    >
      <iframe
        v-if="transitionBlobUrl"
        ref="transitionIframe"
        :src="transitionBlobUrl"
        class="klp-h-full klp-w-full klp-rounded-[var(--input-rounded)]"
        :class="[hasError && 'klp-pointer-events-none klp-opacity-0']"
        :style="{
          gridArea: '1 / 1 / 1 / 1',
        }"
      />
      <iframe
        v-if="blobUrl"
        ref="iframe"
        :src="blobUrl"
        class="klp-h-full klp-w-full klp-rounded-[var(--input-rounded)]"
        :class="[
          (isRendering || hasError) && 'klp-pointer-events-none klp-opacity-0',
        ]"
        :style="{
          gridArea: '1 / 1 / 1 / 1',
        }"
      />
      <div
        v-if="hasError"
        class="klp-flex klp-items-center klp-justify-center klp-rounded-[var(--input-rounded)] klp-border klp-border-dashed klp-border-[var(--color-gray-400)]"
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
            throttledRenderPreview(unsavedContent, {
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
