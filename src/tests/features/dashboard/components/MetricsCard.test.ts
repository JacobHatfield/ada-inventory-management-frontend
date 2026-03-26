import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MetricsCard from '@/features/dashboard/components/MetricsCard.vue';

describe('MetricsCard.vue', () => {
  it('renders title and value properly', () => {
    const wrapper = mount(MetricsCard, {
      props: {
        title: 'Total Items',
        value: 42,
      },
    });

    expect(wrapper.text()).toContain('Total Items');
    expect(wrapper.text()).toContain('42');
  });

  it('renders a trend if provided', () => {
    const wrapper = mount(MetricsCard, {
      props: {
        title: 'Test',
        value: 10,
        trend: 5,
      },
    });

    expect(wrapper.text()).toContain('+5');
    expect(wrapper.find('.text-emerald-600').exists()).toBe(true);
  });

  it('renders negative trend correctly', () => {
    const wrapper = mount(MetricsCard, {
      props: {
        title: 'Test',
        value: 10,
        trend: -2,
      },
    });

    expect(wrapper.text()).toContain('-2');
    expect(wrapper.find('.text-red-600').exists()).toBe(true);
  });

  it('applies the color theme properly', () => {
    const wrapper = mount(MetricsCard, {
      props: {
        title: 'Test',
        value: 10,
        colorTheme: 'blue',
      },
    });

    // We can just verify the class is present on the wrapper's inner elements
    expect(wrapper.find('.bg-blue-50').exists()).toBe(true);
    expect(wrapper.find('.text-blue-600').exists()).toBe(true);
  });
});
