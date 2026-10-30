<script setup lang="ts">
import type { PropType } from "vue";
import type { DevicePreset, PreviewFieldLabels } from "../../types";
import {
  help as helpProp,
  id as idProp,
  name as nameProp,
} from "kirbyuse/props";
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue";
import {
  DEVICE_VIEWPORT_WIDTHS,
  getDeviceFrameStyles,
} from "../../utils/device";

const props = defineProps({
  ...helpProp,
  ...idProp,
  ...nameProp,
  label: {
    type: String,
    required: true,
  },
  labels: {
    type: Object as PropType<PreviewFieldLabels>,
    required: true,
  },
  aspectRatio: String,
  devicePreview: String as PropType<DevicePreset>,
  containerHeight: String,
  src: String,
  transitionSrc: String,
  isRendering: Boolean,
  showTransition: Boolean,
  hasError: Boolean,
});

const emit = defineEmits<{
  (event: "open"): void;
  (event: "restart"): void;
  (event: "retry"): void;
}>();

const DEVICE_ICONS: Record<DevicePreset, string> = {
  mobile: "mobile",
  tablet: "tablet",
  desktop: "display",
};
const DEVICE_PRESETS = Object.keys(DEVICE_VIEWPORT_WIDTHS) as DevicePreset[];

const devicePreview = ref(props.devicePreview);
const containerSize = ref({ width: 0, height: 0 });

const container = useTemplateRef("container");
const iframe = useTemplateRef("iframe");
const transitionIframe = useTemplateRef("transitionIframe");

const deviceWidth = computed(
  () => devicePreview.value && DEVICE_VIEWPORT_WIDTHS[devicePreview.value],
);
const isInsetDevicePreview = computed(
  () => !!deviceWidth.value && deviceWidth.value < containerSize.value.width,
);
const frameStyles = computed(() =>
  deviceWidth.value
    ? getDeviceFrameStyles(deviceWidth.value, containerSize.value)
    : { width: "100%", height: "100%", transform: "none" },
);

let resizeObserver: ResizeObserver | undefined;

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    if (!container.value) return;
    containerSize.value = {
      width: container.value.clientWidth,
      height: container.value.clientHeight,
    };
  });
  resizeObserver.observe(container.value!);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});

defineExpose({ iframe, transitionIframe });

function setDevicePreview(device: DevicePreset) {
  devicePreview.value = device === devicePreview.value ? undefined : device;
}

function uppercaseFirst(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
</script>

<template>
  <k-field
    :id="id"
    :help="help"
    :input="false"
    :label="label"
    :name="name"
    type="preview"
  >
    <template #options>
      <div class="klp-flex klp-items-center klp-gap-2">
        <slot name="options" />

        <k-button-group layout="collapsed">
          <k-button
            v-for="device in DEVICE_PRESETS"
            :key="device"
            variant="filled"
            :theme="devicePreview === device ? 'blue' : undefined"
            size="xs"
            :title="uppercaseFirst(device)"
            :icon="DEVICE_ICONS[device]"
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
          :title="labels.open"
          :disabled="!src && !$slots.default"
          @click="emit('open')"
        />
        <k-button
          variant="filled"
          size="xs"
          icon="live-preview-restart"
          :title="labels.restart"
          @click="emit('restart')"
        />
      </div>
    </template>

    <div
      ref="container"
      class="klp-grid klp-min-h-[55dvh] klp-rounded-[var(--input-rounded)]"
      :class="[
        isRendering && 'klp-pointer-events-none',
        (transitionSrc || $slots.default) &&
          !hasError &&
          !isInsetDevicePreview &&
          'klp-[box-shadow:var(--shadow-md)]',
        (!(transitionSrc || $slots.default) || hasError) &&
          'klp-border klp-border-dashed klp-border-[var(--preview-color-border)]',
        // Allow for the overflow shadow of an inset device preview.
        devicePreview && 'klp-relative klp-overflow-visible',
      ]"
      :style="{
        '--preview-color-border':
          'light-dark(var(--color-gray-400),var(--color-border))',
        aspectRatio,
        height: aspectRatio ? 'auto' : containerHeight,
        maxWidth: '100%',
      }"
      data-theme="passive"
    >
      <template v-if="src">
        <iframe
          v-if="transitionSrc"
          ref="transitionIframe"
          :src="transitionSrc"
          class="klp-rounded-[var(--input-rounded)] klp-bg-[var(--input-color-back)]"
          :class="[
            hasError && 'klp-pointer-events-none klp-opacity-0',
            showTransition &&
              !hasError &&
              isInsetDevicePreview &&
              'klp-[box-shadow:var(--shadow-md)]',
          ]"
          :style="{ gridArea: '1 / 1 / 2 / 2', ...frameStyles }"
        />
        <iframe
          ref="iframe"
          :src="src"
          class="klp-rounded-[var(--input-rounded)] klp-bg-[var(--input-color-back)]"
          :class="[
            (showTransition || hasError) &&
              'klp-pointer-events-none klp-opacity-0',
            !showTransition &&
              !hasError &&
              isInsetDevicePreview &&
              'klp-[box-shadow:var(--shadow-md)]',
          ]"
          :style="{ gridArea: '1 / 1 / 2 / 2', ...frameStyles }"
        />
      </template>
      <div
        v-else-if="$slots.default"
        class="klp-overflow-y-auto klp-rounded-[var(--input-rounded)] klp-bg-[var(--input-color-back)]"
        :class="[isInsetDevicePreview && 'klp-[box-shadow:var(--shadow-md)]']"
        :style="{ gridArea: '1 / 1 / 2 / 2', ...frameStyles }"
      >
        <slot />
      </div>

      <div
        v-if="hasError"
        class="klp-flex klp-items-center klp-justify-center"
        :style="{ gridArea: '1 / 1 / 2 / 2' }"
      >
        <k-button
          variant="filled"
          theme="notice"
          icon="alert"
          :text="labels.renderError"
          @click="emit('retry')"
        />
      </div>
    </div>
  </k-field>
</template>
