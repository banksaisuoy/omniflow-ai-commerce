/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { ChartStyle, ChartConfig } from './chart';
import { describe, it, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

describe('ChartStyle', () => {
  it('renders styles properly without using dangerouslySetInnerHTML', () => {
    const config: ChartConfig = {
      color1: {
        color: 'red',
      },
    };

    const { container } = render(
      <ChartStyle id="chart-1" config={config} />
    );
    const styleTag = container.querySelector('style');
    expect(styleTag).toBeInTheDocument();

    expect(styleTag?.textContent).toContain('--color-color1: red;');
    expect(styleTag?.textContent).toContain('[data-chart=chart-1]');
  });

  it('should not allow XSS injection', () => {
    const config: ChartConfig = {
      malicious: {
        color: 'red</style><script>alert(1)</script>',
      },
    };

    const { container } = render(
      <ChartStyle id="chart-2" config={config} />
    );
    const styleTag = container.querySelector('style');

    expect(styleTag?.textContent).toContain('red</style><script>alert(1)</script>');

    const scriptTag = container.querySelector('script');
    expect(scriptTag).not.toBeInTheDocument();
  });
});
