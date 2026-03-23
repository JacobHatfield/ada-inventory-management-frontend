import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppPagination from './AppPagination.vue';

describe('AppPagination.vue', () => {
  it('renders pagination info correctly', () => {
    const wrapper = mount(AppPagination, {
      props: {
        currentPage: 2,
        totalPages: 5,
        totalItems: 42,
        pageSize: 10,
      },
    });

    expect(wrapper.text()).toContain('Showing');
    expect(wrapper.text()).toContain('11'); // startItem
    expect(wrapper.text()).toContain('20'); // endItem
    expect(wrapper.text()).toContain('42'); // totalItems
  });

  it('adjusts endItem for the last page', () => {
    const wrapper = mount(AppPagination, {
      props: {
        currentPage: 5,
        totalPages: 5,
        totalItems: 42,
        pageSize: 10,
      },
    });

    expect(wrapper.text()).toContain('Showing');
    expect(wrapper.text()).toContain('41'); // startItem
    expect(wrapper.text()).toContain('42'); // endItem
  });

  it('emits update:page when a page number is clicked', async () => {
    const wrapper = mount(AppPagination, {
      props: {
        currentPage: 2,
        totalPages: 5,
        totalItems: 42,
      },
    });

    const pageButtons = wrapper.findAll('button').filter((b) => !isNaN(Number(b.text())));
    expect(pageButtons).toHaveLength(5);

    const page3Btn = pageButtons.find((b) => b.text() === '3');
    await page3Btn?.trigger('click');

    expect(wrapper.emitted('update:page')).toBeTruthy();
    expect(wrapper.emitted('update:page')?.[0]).toEqual([3]);
  });

  it('emits update:page when next/prev are clicked', async () => {
    const wrapper = mount(AppPagination, {
      props: {
        currentPage: 2,
        totalPages: 5,
        totalItems: 42,
      },
    });

    const buttons = wrapper.findAll('button');
    const mobilePrev = buttons[0];
    const mobileNext = buttons[1];

    await mobileNext.trigger('click');
    expect(wrapper.emitted('update:page')?.[0]).toEqual([3]);

    await mobilePrev.trigger('click');
    expect(wrapper.emitted('update:page')?.[1]).toEqual([1]);
  });

  it('disables previous button on first page', () => {
    const wrapper = mount(AppPagination, {
      props: {
        currentPage: 1,
        totalPages: 5,
        totalItems: 42,
      },
    });

    const buttons = wrapper.findAll('button');
    const mobilePrev = buttons[0];

    expect(mobilePrev.element.disabled).toBe(true);
  });

  it('disables next button on last page', () => {
    const wrapper = mount(AppPagination, {
      props: {
        currentPage: 5,
        totalPages: 5,
        totalItems: 42,
      },
    });

    const buttons = wrapper.findAll('button');
    const mobileNext = buttons[1];

    expect(mobileNext.element.disabled).toBe(true);
  });
});
