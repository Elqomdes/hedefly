import { useState, useEffect } from 'react';

export default function useResponsive() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [deviceType, setDeviceType] = useState('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });

      if (width < 640) {
        setDeviceType('mobile');
      } else if (width < 768) {
        setDeviceType('sm-mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else if (width < 1280) {
        setDeviceType('laptop');
      } else {
        setDeviceType('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    ...screenSize,
    deviceType,
    isMobile: deviceType === 'mobile' || deviceType === 'sm-mobile',
    isTablet: deviceType === 'tablet',
    isLaptop: deviceType === 'laptop',
    isDesktop: deviceType === 'desktop',
    isSmallScreen: deviceType === 'mobile' || deviceType === 'sm-mobile' || deviceType === 'tablet',
  };
}

