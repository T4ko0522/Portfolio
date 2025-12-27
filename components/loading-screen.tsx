import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";

type LoaderProps = {
  onLoadingComplete?: () => void;
};

const Loader: React.FC<LoaderProps> = ({ onLoadingComplete }) => {
  const [lines, setLines] = useState<Array<{ type: 'prompt' | 'command' | 'output' | 'special'; text: string }>>([]);
  const [currentLine, setCurrentLine] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  // 新しい行が追加されたときに自動的にスクロール
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [lines, currentLine]);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const delay = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(() => !cancelled && resolve(), ms);
        timers.push(t);
      });

    // 1文字ずつタイプ
    const typeText = async (target: string, speed = 90) => {
      setCurrentLine("");
      for (let i = 0; i < target.length && !cancelled; i++) {
        setCurrentLine((prev) => prev + target[i]);
        await delay(speed);
      }
    };

    const addLine = (type: 'prompt' | 'command' | 'output' | 'special', text: string) => {
      setLines((prev) => [...prev, { type, text }]);
      setCurrentLine("");
    };

    const run = async () => {
      // 初期プロンプト
      addLine('prompt', '~/Project $');
      
      // cd Portfolio
      await typeText("cd Portfolio", 90);
      addLine('command', 'cd Portfolio');
      await delay(300);

      // 新しいプロンプト行
      addLine('prompt', '~/Project/Portfolio $');
      await typeText("pnpm run build", 90);
      addLine('command', 'pnpm run build');
      
      // ビルド出力をシミュレート
      await delay(500);
      addLine('output', '> portfolio@0.1.0 build');
      await delay(300);
      addLine('output', '> next build');
      await delay(400);
      addLine('output', '');
      await delay(300);
      addLine('special', '   ▲ Next.js 15.0.5');
      await delay(400);
      addLine('output', '');
      await delay(400);
      addLine('output', '   Creating an optimized production build ...');
      await delay(800);
      addLine('output', ' ✓ Compiled successfully');
      await delay(1200);
      addLine('output', '✓ Generating static pages (5/5)');
      await delay(200);

      // 新しいプロンプト行
      addLine('prompt', '~/Project/Portfolio $');
      await typeText("pnpm start", 90);
      addLine('command', 'pnpm start');
      
      // 起動出力をシミュレート
      await delay(300);
      addLine('output', '> portfolio@0.1.0 start');
      await delay(200);
      addLine('output', '> next start');
      await delay(400);
      addLine('special', '   ▲ Next.js 15.0.5');
      await delay(400);
      addLine('output', ' ✓ Starting...');
      await delay(400);
      addLine('output', ' ✓ Ready in 1.2s');
      await delay(1000);

      if (!cancelled) onLoadingComplete?.();
    };

    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [onLoadingComplete]);

  return (
    <StyledWrapper>
      <div className="terminal-loader">
        <div className="terminal-header">
          <div className="terminal-title">root@t4ko0522: ~</div>
          <div className="terminal-controls">
            <div className="control close" />
            <div className="control minimize" />
            <div className="control maximize" />
          </div>
        </div>
        <div className="terminal-content" ref={contentRef}>
          {lines.map((line, index) => {
            // チェックマークを含む行の場合、チェックマークをspanで囲む
            if (line.type === 'output' && line.text.includes('✓')) {
              const parts = line.text.split('✓');
              return (
                <div key={index} className={`line line-${line.type}`}>
                  {parts.map((part, i) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < parts.length - 1 && <span className="checkmark">✓</span>}
                    </React.Fragment>
                  ))}
                </div>
              );
            }
            return (
              <div key={index} className={`line line-${line.type}`}>
                {line.text}
              </div>
            );
          })}
          {currentLine && (
            <div className="line line-command">
              {currentLine}
              <span className="cursor">█</span>
            </div>
          )}
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;
  z-index: 9999;

  @keyframes blinkCursor {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }

  .terminal-loader {
    border: 0.1em solid #333;
    background-color: #1a1a1a;
    color: #0f0;
    font-family: "Consolas", "Courier New", Courier, monospace;
    font-size: 1.4em;
    padding: 0;
    width: 35em;
    height: 20em;
    max-width: 90vw;
    max-height: 80vh;
    box-shadow: 0 4px 16px rgba(0,0,0,0.25);
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 600px) {
    .terminal-loader {
      font-size: 1em;
      width: 95vw;
      height: 18em;
    }
    .terminal-header {
      font-size: 0.9em;
    }
    .terminal-content {
      padding: 0.8em;
    }
  }

  .terminal-header {
    position: absolute; top: 0; left: 0; right: 0; height: 1.5em;
    background-color: #333;
    border-top-left-radius: 4px; border-top-right-radius: 4px;
    padding: 0 0.4em; box-sizing: border-box;
  }

  .terminal-controls { float: right; }
  .control {
    display: inline-block; width: 0.6em; height: 0.6em;
    margin-left: 0.4em; border-radius: 50%; background-color: #777;
  }
  .control.close { background-color: #e33; }
  .control.minimize { background-color: #ee0; }
  .control.maximize { background-color: #0b0; }
  .terminal-title { float: left; line-height: 1.5em; color: #eee; }

  .terminal-content {
    flex: 1;
    padding: 1em;
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 1.5em;
    
    /* スクロールバーのスタイル */
    scrollbar-width: thin;
    scrollbar-color: #555 #1a1a1a;
    
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: #1a1a1a;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #555;
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: #666;
    }
  }

  .line {
    font-size: 0.9em;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .line-prompt {
    color: #3b78ff
  }

  .line-command {
    color: #d4d4d4; /* 白色のコマンド */
  }

  .line-output {
    color: #ffffff; /* 白色の出力 */
  }

  .checkmark {
    color: #4ac66b; /* チェックマークの色 */
  }

  .line-special {
    color: #ad7fa8
  }

  .cursor {
    display: inline-block;
    background-color: #0f0;
    width: 0.5em;
    height: 1em;
    margin-left: 0.1em;
    animation: blinkCursor 0.8s step-end infinite;
    vertical-align: text-bottom;
  }
`;

export default Loader;
