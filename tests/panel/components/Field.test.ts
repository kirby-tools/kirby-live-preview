// @vitest-environment happy-dom
import { shallowMount } from "@vue/test-utils";
import { expect, it, vi } from "vitest";
import { ref } from "vue";
import Field from "../../../src/panel/components/Field.vue";
import FieldBody from "../../../src/panel/components/Ui/FieldBody.vue";

vi.mock("kirbyuse", () => ({
  useContent: () => ({ contentChanges: ref({}) }),
  useHelpers: () => ({}),
  usePanel: () => ({
    api: { post: () => new Promise(() => {}) },
    language: { code: null },
    languages: [],
    t: (key: string) => key,
  }),
  usePanelEvent: () => {},
}));

vi.mock("@kirby-tools/licensing/components", () => ({
  LicensingButtonGroup: {},
}));

it("keeps disabled off k-field", () => {
  const wrapper = shallowMount(Field, {
    props: {
      name: "preview",
      label: "Live Preview",
      endpoints: { field: "pages/about/fields/preview" },
      licenseStatus: "active",
      licenseDialog: "",
    },
    attrs: { disabled: true },
  });

  expect(
    wrapper.findComponent(FieldBody).attributes("disabled"),
  ).toBeUndefined();
});
