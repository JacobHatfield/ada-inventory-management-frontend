import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

const SimpleComp = defineComponent({
  template: '<div>Simple</div>',
});

describe('Simple Component', () => {
  it('renders correctly', () => {
    const wrapper = mount(SimpleComp);
    expect(wrapper.text()).toBe('Simple');
  });
});
