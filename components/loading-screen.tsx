import React, { useEffect, useState, useRef } from "react";
import styles from "./loading-screen.module.css";

type LoaderProps = {
  onLoadingComplete?: () => void;
};

const lineTypeClass = {
  prompt: styles.prompt,
  command: styles.command,
  output: styles.output,
  special: styles.special,
} as const;

const Loader: React.FC<LoaderProps> = ({ onLoadingComplete }) => {
  const [lines, setLines] = useState<Array<{ type: 'prompt' | 'command' | 'output' | 'special'; text: string }>>([]);
  const [currentLine, setCurrentLine] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const onLoadingCompleteRef = useRef(onLoadingComplete);

  // onLoadingCompleteの最新の参照を保持
  useEffect(() => {
    onLoadingCompleteRef.current = onLoadingComplete;
  }, [onLoadingComplete]);

  // 新しい行が追加されたときに自動的にスクロール
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [lines, currentLine]);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const startTime = Date.now();

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
      await typeText("pnpm start", 90);
      addLine('command', 'pnpm start');

      // 起動出力をシミュレート
      await delay(300);
      addLine('output', '> portfolio@1.1.0 start');
      await delay(200);
      addLine('output', '> next start');
      await delay(400);
      addLine('special', '   ▲ Next.js 15.0.5');
      await delay(400);
      addLine('output', ' ✓ Starting...');
      await delay(400);

      // 実際の経過時間を計算して表示
      const elapsedTime = (Date.now() - startTime) / 1000;
      const formattedTime = elapsedTime.toFixed(1);
      addLine('output', ` ✓ Ready in ${formattedTime}s`);
      await delay(1000);

      if (!cancelled) onLoadingCompleteRef.current?.();
    };

    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []); // 依存配列を空にして、一度だけ実行されるようにする

  return (
    <div className={styles.wrapper}>
      <div className={styles.terminal}>
        <div className={styles.header}>
          <div className={styles.title}>root@t4ko0522: ~</div>
          <div className={styles.controls}>
            <div className={`${styles.control} ${styles.close}`} />
            <div className={`${styles.control} ${styles.minimize}`} />
            <div className={`${styles.control} ${styles.maximize}`} />
          </div>
        </div>
        <div className={styles.content} ref={contentRef}>
          {lines.map((line, index) => {
            // チェックマークを含む行の場合、チェックマークをspanで囲む
            if (line.type === 'output' && line.text.includes('✓')) {
              const parts = line.text.split('✓');
              return (
                <div key={index} className={`${styles.line} ${lineTypeClass[line.type]}`}>
                  {parts.map((part, i) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < parts.length - 1 && <span className={styles.checkmark}>✓</span>}
                    </React.Fragment>
                  ))}
                </div>
              );
            }
            return (
              <div key={index} className={`${styles.line} ${lineTypeClass[line.type]}`}>
                {line.text}
              </div>
            );
          })}
          {currentLine && (
            <div className={`${styles.line} ${styles.command}`}>
              {currentLine}
              <span className={styles.cursor}>█</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Loader;
