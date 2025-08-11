import React, { useEffect, useState } from "react";
import styled from "styled-components";

type LoaderProps = {
  onLoadingComplete?: () => void;
};

const Loader: React.FC<LoaderProps> = ({ onLoadingComplete }) => {
  const [text, setText] = useState("");

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
      setText("");
      for (let i = 0; i < target.length && !cancelled; i++) {
        setText((prev) => prev + target[i]);
        await delay(speed);
      }
    };

    const run = async () => {
      // 1回目 Loading...
      await typeText("Loading...", 500);
      await delay(300);

      // Complete をタイプ表示
      await typeText("Complete!", 100);

      // 1秒表示して終了
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
          <div className="terminal-title">Ubuntu 24.04.2 LTS</div>
          <div className="terminal-controls">
            <div className="control close" />
            <div className="control minimize" />
            <div className="control maximize" />
          </div>
        </div>
        <div className="text">{text}</div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  @keyframes blinkCursor {
    50% { border-right-color: transparent; }
  }

  .terminal-loader {
    border: 0.1em solid #333;
    background-color: #1a1a1a;
    color: #0f0;
    font-family: "Courier New", Courier, monospace;
    font-size: 1.6em;
    padding: 2.5em 2em;
    width: 22em;
    box-shadow: 0 4px 16px rgba(0,0,0,0.25);
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
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

  .text {
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    border-right: 0.2em solid green; /* カーソル */
    animation: blinkCursor 0.5s step-end infinite alternate;
    margin-top: 1.5em;
  }
`;

export default Loader;
