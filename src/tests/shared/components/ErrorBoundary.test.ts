import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref, nextTick } from 'vue';
import ErrorBoundary from '@/shared/components/ErrorBoundary.vue';

const CrashingComp = defineComponent({
  props: ['shouldCrash'],
  setup(props) {
    if (props.shouldCrash) {
      throw new Error('Test Error');
    }
    return () => h('div', 'Healthy');
  },
});

describe('ErrorBoundary.vue', () => {
  it('renders child content when no error', () => {
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<div>Child Content</div>',
      },
    });
    expect(wrapper.text()).toContain('Child Content');
  });

  it('catches error from child and displays it', async () => {
    const wrapper = mount(ErrorBoundary, {
      global: {
        config: { errorHandler: () => false },
      },
      slots: {
        default: h(CrashingComp, { shouldCrash: true }),
      },
    });

    await nextTick();
    expect(wrapper.text()).toContain('An unexpected error occurred');
    expect(wrapper.text()).toContain('Test Error');
  });

  it('clears error and renders healthy content when Dismiss is clicked', async () => {
    const shouldCrash = ref(true);
    const wrapper = mount(ErrorBoundary, {
      global: {
        config: { errorHandler: () => false },
      },
      slots: {
        default: () => h(CrashingComp, { shouldCrash: shouldCrash.value }),
      },
    });

    await nextTick();
    expect(wrapper.text()).toContain('An unexpected error occurred');

    // Make it healthy before dismissing
    shouldCrash.value = false;
    await nextTick();
    const button = wrapper.find('button');
    await button.trigger('click');
    await nextTick();

    expect(wrapper.text()).not.toContain('An unexpected error occurred');
    expect(wrapper.text()).toContain('Healthy');
  });
});
