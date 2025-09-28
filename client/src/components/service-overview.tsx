import { useState, useEffect } from 'react';

function CountingNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    let startTime = Date.now();
    const duration = 2000; // 2 seconds
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * target);
      
      setCount(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };
    
    requestAnimationFrame(animate);
  }, [target]);

  return <span>{count}{suffix}</span>;
}

export default function ServiceOverview() {
  return (
    <div className="glass-surface" style={{ padding: '100px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div className="glass-card-primary text-white px-6 py-3 rounded-full font-semibold mb-6 inline-block">
            Legal Expertise Since 2003
          </div>
          <h2 className="text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight tracking-tight">
            <span className="block text-black dark:text-white">Professional Legal</span>
            <span className="block text-blue-600 dark:text-blue-400">Expert Assistance</span>
          </h2>
          <p style={{ 
            fontSize: '1.125rem', 
            color: '#374151', 
            maxWidth: '768px', 
            margin: '0 auto',
            letterSpacing: 'var(--ios26-letter-spacing)',
            lineHeight: 'var(--ios26-line-height)'
          }}>
            Polish citizenship by descent requires specialized legal expertise. Unlike services promising "quick solutions," 
            we provide honest guidance through this complex 2-4 year process.
          </p>
        </div>

        <div className="flex flex-col gap-8 max-w-xs mx-auto">
          <div className="glass-card p-6 flex flex-col justify-center items-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-blue mb-2">
                <CountingNumber target={22} suffix="+" key="years" />
              </div>
              <div className="text-gray-700 font-medium text-base leading-tight">Years Experience</div>
            </div>
          </div>
          
          <div className="glass-card p-6 flex flex-col justify-center items-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-blue mb-2">
                <CountingNumber target={5000} suffix="+" key="cases" />
              </div>
              <div className="text-gray-700 font-medium text-base leading-tight">Cases Processed</div>
            </div>
          </div>
          
          <div className="glass-card p-6 flex flex-col justify-center items-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-blue mb-2">
                <CountingNumber target={100} suffix="%" key="success" />
              </div>
              <div className="text-gray-700 font-medium text-base leading-tight">True Success Rate</div>
            </div>
          </div>
          
          <div className="glass-card p-6 flex flex-col justify-center items-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-blue mb-2">24/7</div>
              <div className="text-gray-700 font-medium text-base leading-tight">Case Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}