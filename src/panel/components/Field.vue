<script setup lang="ts">
import type { PropType } from "vue";
import type { PreviewFieldLabels, UpdateStrategy } from "../types";
import { licenseProps } from "@kirby-tools/licensing";
import { LicensingButtonGroup } from "@kirby-tools/licensing/components";
import { useContent, useHelpers, usePanel, usePanelEvent } from "kirbyuse";
import {
  disabled as disabledProp,
  help as helpProp,
  id as idProp,
  name as nameProp,
} from "kirbyuse/props";
import throttle from "throttleit";
import { joinURL, withLeadingSlash } from "ufo";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch,
} from "vue";
import { useLocale } from "../composables";
import FieldBody from "./Ui/FieldBody.vue";

interface RenderOptions {
  persistScrollPosition?: boolean;
}

const props = defineProps({
  // Declared to keep `disabled` off `k-field`, so the field never looks disabled.
  ...disabledProp,
  ...helpProp,
  ...idProp,
  ...nameProp,
  label: {
    type: String,
    required: true,
  },
  endpoints: {
    type: Object as PropType<{ field: string }>,
    required: true,
  },
  updateStrategy: {
    type: String as PropType<UpdateStrategy>,
    default: "interval",
  },
  updateInterval: {
    type: [Number, Boolean] as PropType<number | false>,
    default: 500,
  },
  aspectRatio: String,
  ...licenseProps,
});

// eslint-disable-next-line regexp/no-super-linear-backtracking
const PATH_PARAMS_REGEX = /\/[^/]+?:.+$/;

const panel = usePanel();
const helpers = useHelpers();
const { getNonLocalizedPath } = useLocale();
const { contentChanges } = useContent();

const hasLicenseButtons = !__PLAYGROUND__;
const labels: PreviewFieldLabels = {
  open: panel.t("open"),
  renderError: panel.t("johannschopplich.preview.error.render"),
};

const body = useTemplateRef("body");
const isRendering = ref(false);
const showTransition = ref(false);
const hasError = ref(false);
const blobUrl = ref<string>();
const transitionBlobUrl = ref<string>();

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

const throttledRenderPreview = throttle(
  renderPreview,
  props.updateInterval || 500,
);
let lastRenderedContent: string | undefined;
let topbarObserver: IntersectionObserver | undefined;
const eventsController = new AbortController();

watch(contentChanges, (newValue) => {
  if (
    props.updateInterval !== false &&
    props.updateStrategy === "interval" &&
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

usePanelEvent("page.changeTitle", renderUnsavedContent);
usePanelEvent("file.sort", renderUnsavedContent);

onMounted(() => {
  renderUnsavedContent();

  const topbar = document.querySelector<HTMLElement>(".k-topbar");
  const header = document.querySelector<HTMLElement>(".k-header");

  if (!props.aspectRatio && topbar && header) {
    topbarHeight.value = topbar.offsetHeight;
    headerHeight.value = header.offsetHeight;

    topbarObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        isTopbarVisible.value = entry.isIntersecting;
        if (entry.isIntersecting) {
          topbarHeight.value = (entry.target as HTMLElement).offsetHeight;
        }
      },
      {
        threshold: [0],
        rootMargin: "64px 0px 0px 0px",
      },
    );

    topbarObserver.observe(topbar);
  }

  window.addEventListener("message", handleMessage, {
    signal: eventsController.signal,
  });

  if (props.updateStrategy === "blur") {
    document.body.addEventListener(
      "blur",
      () => {
        if (JSON.stringify(contentChanges.value) !== lastRenderedContent) {
          throttledRenderPreview(contentChanges.value);
        }
      },
      { capture: true, signal: eventsController.signal },
    );
  }
});

onBeforeUnmount(() => {
  eventsController.abort();
  topbarObserver?.disconnect();

  if (blobUrl.value) {
    URL.revokeObjectURL(blobUrl.value);
  }
});

function renderUnsavedContent(options?: RenderOptions) {
  throttledRenderPreview(contentChanges.value, options);
}

function openPreviewInTab() {
  if (!blobUrl.value) return;
  window.open(new URL(blobUrl.value), "_blank");
}

async function renderPreview(
  content: Record<string, unknown>,
  { persistScrollPosition = true }: RenderOptions = {},
) {
  if (isRendering.value) return;
  isRendering.value = true;

  let scrollPosition = 0;

  if (body.value?.iframe) {
    scrollPosition = body.value.iframe.contentWindow?.scrollY ?? 0;
    body.value.transitionIframe?.contentWindow?.scrollTo(0, scrollPosition);
  }

  showTransition.value = true;

  try {
    const { data: html } = await panel.api.post<{ data: string }>(
      `${props.endpoints.field}/render`,
      { content },
    );

    const lastBlobUrl = blobUrl.value;
    const blob = new Blob([html], { type: "text/html" });
    blobUrl.value = URL.createObjectURL(blob);

    await nextTick();
    const iframe = body.value!.iframe!;
    await new Promise<void>((resolve) => {
      iframe.addEventListener(
        "load",
        () => {
          if (scrollPosition && persistScrollPosition) {
            iframe.contentWindow?.scrollTo(0, scrollPosition);
          }
          resolve();
        },
        { once: true },
      );
    });

    showTransition.value = false;
    hasError.value = false;
    transitionBlobUrl.value = blobUrl.value;
    lastRenderedContent = JSON.stringify(content);

    if (lastBlobUrl) {
      URL.revokeObjectURL(lastBlobUrl);
    }
  } catch (error) {
    console.error(error);
    hasError.value = true;
    showTransition.value = false;
  } finally {
    isRendering.value = false;
  }
}

async function handleMessage({ data, source }: MessageEvent) {
  // Only the preview frames may save or navigate the Panel.
  if (
    source !== body.value?.iframe?.contentWindow &&
    source !== body.value?.transitionIframe?.contentWindow
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
</script>

<template>
  <FieldBody
    :id="id"
    ref="body"
    :help="help"
    :label="label"
    :name="name"
    :labels="labels"
    :aspect-ratio="aspectRatio"
    :container-height="containerHeight"
    :src="blobUrl"
    :transition-src="transitionBlobUrl"
    :is-rendering="isRendering"
    :show-transition="showTransition"
    :has-error="hasError"
    @open="openPreviewInTab()"
    @restart="renderUnsavedContent()"
    @retry="renderUnsavedContent({ persistScrollPosition: false })"
  >
    <template v-if="hasLicenseButtons" #options>
      <LicensingButtonGroup
        :dialog="licenseDialog"
        :license-status="licenseStatus"
        pricing-url="https://kirby.tools/live-preview/buy"
      />
    </template>
  </FieldBody>
</template>
