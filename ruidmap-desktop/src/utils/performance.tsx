import React, { memo, useMemo, useCallback, useRef, useEffect, useState, ReactNode } from 'react';

// Memoized Component Wrapper
export const withMemo = <P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return memo(Component, areEqual);
};

// Virtual List Component for Large Datasets
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
}

export const VirtualList = <T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
}: VirtualListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  const totalHeight = items.length * itemHeight;
  const offsetY = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan) * itemHeight;

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Intersection Observer Hook for Lazy Loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options]);

  return [elementRef, entry] as const;
};

// Lazy Image Component
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  threshold?: number;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=',
  className = '',
  threshold = 0.1,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, entry] = useIntersectionObserver({
    threshold,
    rootMargin: '50px',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (entry?.isIntersecting && imageSrc === placeholder) {
      setImageSrc(src);
    }
  }, [entry, src, imageSrc, placeholder]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <img
      ref={imageRef as React.RefObject<HTMLImageElement>}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      onLoad={handleLoad}
      {...props}
    />
  );
};

// Debounced Input Hook
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttled Function Hook
export const useThrottle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T => {
  const lastCallTime = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCallTime.current >= delay) {
        lastCallTime.current = now;
        func(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCallTime.current = Date.now();
          func(...args);
        }, delay - (now - lastCallTime.current));
      }
    }) as T,
    [func, delay]
  );
};

// Performance Monitor Hook
interface PerformanceMetrics {
  renderTime: number;
  componentMounts: number;
  componentUpdates: number;
  memoryUsage?: number;
}

export const usePerformanceMonitor = (componentName: string): PerformanceMetrics => {
  const renderStartTime = useRef<number>(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentMounts: 0,
    componentUpdates: 0,
  });

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    
    setMetrics(prev => ({
      ...prev,
      renderTime,
      componentMounts: prev.componentMounts + 1,
    }));

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} - Render time: ${renderTime.toFixed(2)}ms`);
    }
  }, [componentName]);

  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      componentUpdates: prev.componentUpdates + 1,
    }));
  });

  // Memory usage monitoring (if available)
  useEffect(() => {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memoryInfo.usedJSHeapSize / (1024 * 1024), // MB
      }));
    }
  });

  return metrics;
};

// Code Splitting Component
interface DynamicImportProps {
  importFunc: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}

export const DynamicImport: React.FC<DynamicImportProps> = ({
  importFunc,
  fallback = <div>Loading...</div>,
  errorFallback = <div>Error loading component</div>,
}) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    importFunc()
      .then((module) => {
        if (mounted) {
          setComponent(() => module.default);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [importFunc]);

  if (loading) return <>{fallback}</>;
  if (error) return <>{errorFallback}</>;
  if (!Component) return null;

  return <Component />;
};

// Optimized List Component
interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  className?: string;
  batchSize?: number;
  initialBatchSize?: number;
}

export const OptimizedList = <T,>({
  items,
  renderItem,
  keyExtractor,
  className = '',
  batchSize = 20,
  initialBatchSize = 10,
}: OptimizedListProps<T>) => {
  const [visibleCount, setVisibleCount] = useState(initialBatchSize);

  const [loadMoreTrigger, loadMoreEntry] = useIntersectionObserver({
    threshold: 0.1,
  });

  useEffect(() => {
    if (loadMoreEntry?.isIntersecting && visibleCount < items.length) {
      setVisibleCount(prev => Math.min(prev + batchSize, items.length));
    }
  }, [loadMoreEntry, visibleCount, items.length, batchSize]);

  const visibleItems = useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]);

  return (
    <div className={className}>
      {visibleItems.map((item, index) => (
        <div key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </div>
      ))}
      
      {visibleCount < items.length && (
        <div
          ref={loadMoreTrigger as React.RefObject<HTMLDivElement>}
          className="h-4 flex items-center justify-center"
        >
          <div className="text-sm text-gray-500">Loading more...</div>
        </div>
      )}
    </div>
  );
};

// Resource Prefetching Hook
export const usePrefetch = (resources: string[]) => {
  useEffect(() => {
    const prefetchLink = (href: string) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    };

    const cleanupFunctions = resources.map(prefetchLink);

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [resources]);
};

// Image Preloader Hook
export const useImagePreloader = (imageSources: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const imagePromises = imageSources.map(src => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = reject;
        img.src = src;
      });
    });

    Promise.all(imagePromises)
      .then(sources => {
        if (mounted) {
          setLoadedImages(new Set(sources));
          setAllImagesLoaded(true);
        }
      })
      .catch(console.error);

    return () => {
      mounted = false;
    };
  }, [imageSources]);

  return { loadedImages, allImagesLoaded };
};