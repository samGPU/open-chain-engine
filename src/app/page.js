import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Grand Prix Arena&nbsp; <br></br>
          <code className={styles.code}>a big bang competition project</code>
        </p>
        <div>
          <a
            href="https://www.twitter.com/samgpu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/pfp.png"
              alt="Profile Picture"
              className={styles.profilePicture}
              width={96}
              height={96}
              priority
            />
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/hero.png"
          alt="Hero Image"
          width={480}
          height={270}
          priority
        />
      </div>

      <div className={styles.grid}>
        <div
          className={styles.card}
        >
          <h2>
            Play <span>🕹️</span>
          </h2>
          <p>Score points. Complete objectives. Have fun.</p>
        </div>

        <div
          className={styles.card}
        >
          <h2>
            Claim <span>💎</span>
          </h2>
          <p>Claim an ERC-20 Token based on your performance in-game.</p>
        </div>

        <div
          className={styles.card}
        >
          <h2>
            Upgrade <span>🎁</span>
          </h2>
          <p>Discover in-game perks, upgrades and features based on your balance.</p>
        </div>

        <div
          className={styles.card}
        >
          <h2>
            Trade <span>🤝</span>
          </h2>
          <p>As govenor of your own tokens, you are free to trade them to any eligble wallet.</p>
        </div>

      </div>
    </main>
  );
}
