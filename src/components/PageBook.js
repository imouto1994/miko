import React, {
  useMemo,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { Link } from "gatsby";
import { useInView } from "react-intersection-observer";
import classnames from "classnames";

import { decryptBuffer, createBlobUrl } from "../utils/crypto";
import { fetchWithRetries } from "../utils/fetch";
import { decrypt } from "../utils/string";
import Layout from "./Layout";
import Logo from "./Logo";
import IconSettings from "./IconSettings";
import IconLeft2Right from "./IconLeft2Right";
import IconRight2Left from "./IconRight2Left";
import Image from "./Image";
import useLocalStorage from "../hooks/useLocalStorage";
import useWindowSize from "../hooks/useWindowSize";

import * as styles from "./PageBook.module.css";

const READING_MODE_KEY = "reading_mode";
const READING_MODE_WIDTH = "0";
const READING_MODE_HEIGHT = "1";
const READING_MODE_WEBTOON = "2";
const READING_MODE_COUNT = 3;
const DIRECTION_KEY = "directon";
const DIRECTION_LEFT_TO_RIGHT = "0";
const DIRECTION_RIGHT_TO_LEFT = "1";
const DIRECTION_COUNT = 2;

export default function PageBook(props) {
  const {
    data: {
      bookMeta: { dimensions, name },
      bookPages,
    },
    pageContext: { prevPath, nextPath },
  } = props;
  const decryptedName = useMemo(() => decrypt(name), [name]);
  const [readingMode, setReadingMode] = useLocalStorage(
    READING_MODE_KEY,
    READING_MODE_WIDTH
  );
  const [direction, setDirection] = useLocalStorage(
    DIRECTION_KEY,
    DIRECTION_LEFT_TO_RIGHT
  );
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [navHidden, setNavHidden] = useState(true);

  const goBack = useCallback((pageIndex) => {
    const currentPageEl = document.getElementById(`page-${pageIndex}`);
    const currentPageTop = currentPageEl.getBoundingClientRect().top;
    if (currentPageTop < -5) {
      currentPageEl.scrollIntoView();
    } else if (pageIndex > 0) {
      const prevPageEl = document.getElementById(`page-${pageIndex - 1}`);
      prevPageEl.scrollIntoView();
    }
  }, []);

  const goForward = useCallback((pageIndex) => {
    const currentPageEl = document.getElementById(`page-${pageIndex}`);
    const currentPageTop = currentPageEl.getBoundingClientRect().top;
    if (currentPageTop > 5) {
      currentPageEl.scrollIntoView();
    } else if (pageIndex < bookPages.edges.length - 1) {
      const nextPageEl = document.getElementById(`page-${pageIndex + 1}`);
      nextPageEl.scrollIntoView();
    }
  }, []);

  useEffect(() => {
    function click(x, y) {
      const ev = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
      });
      const el = document.elementFromPoint(x, y);
      el.dispatchEvent(ev);
    }

    function downHandler({ key }) {
      if (key === "ArrowLeft") {
        click(windowWidth / 12, windowHeight / 2);
      } else if (key === "ArrowRight") {
        click((11 * windowWidth) / 12, windowHeight / 2);
      }
    }
    window.addEventListener("keydown", downHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
    };
  }, []);

  const onPageClick = useCallback(
    (e, pageIndex) => {
      const windowWidth = window.innerWidth;
      const clickX = e.clientX;
      if (clickX < windowWidth / 10) {
        if (direction === DIRECTION_LEFT_TO_RIGHT) {
          goBack(pageIndex);
        } else {
          goForward(pageIndex);
        }
      } else if (clickX < (9 * windowWidth) / 10) {
        setNavHidden((flag) => !flag);
      } else {
        if (direction === DIRECTION_LEFT_TO_RIGHT) {
          goForward(pageIndex);
        } else {
          goBack(pageIndex);
        }
      }
    },
    [goBack, goForward, setNavHidden, direction]
  );

  const onReadingModeButtonClick = useCallback(() => {
    setReadingMode(String((parseInt(readingMode) + 1) % READING_MODE_COUNT));
  }, [setReadingMode, readingMode]);

  const onDirectionButtonClick = useCallback(() => {
    setDirection(String((parseInt(direction) + 1) % DIRECTION_COUNT));
  }, [setDirection, direction]);

  return (
    <Layout>
      <Header
        title={decryptedName}
        hidden={navHidden}
        onReadingModeButtonClick={onReadingModeButtonClick}
        onDirectionButtonClick={onDirectionButtonClick}
        readingMode={readingMode}
        direction={direction}
        {...{ prevPath, nextPath }}
      />
      {bookPages.edges.map(({ node: { publicURL } }, index) => {
        const [pageWidth, pageHeight] = dimensions[index];
        return (
          <Page
            {...{
              index,
              pageHeight,
              pageWidth,
              publicURL,
              readingMode,
              windowHeight,
              windowWidth,
              onPageClick,
            }}
            key={publicURL}
          />
        );
      })}
      <div className={styles.footer}>
        {prevPath != null ? (
          <Link to={prevPath} className={styles.footerNavButton}>
            PREV
          </Link>
        ) : null}
        {nextPath != null ? (
          <Link to={nextPath} className={styles.footerNavButton}>
            NEXT
          </Link>
        ) : null}
      </div>
    </Layout>
  );
}

function Header(props) {
  const {
    title,
    hidden,
    readingMode,
    direction,
    onReadingModeButtonClick,
    onDirectionButtonClick,
    prevPath,
    nextPath,
  } = props;

  const headerClassName = classnames(styles.header, {
    [styles.headerHidden]: hidden,
  });

  const readingModeText = useMemo(() => {
    if (readingMode === READING_MODE_HEIGHT) {
      return "H";
    } else if (readingMode === READING_MODE_WIDTH) {
      return "W";
    } else {
      return "T";
    }
  }, [readingMode]);

  return (
    <div className={headerClassName}>
      <div className={styles.headerLeftSection}>
        <Link to="/" className={styles.headerBackLink}>
          <Logo className={styles.headerBackIcon} />
        </Link>
        <div>
          <p className={styles.headerTitle}>{title}</p>
        </div>
        {prevPath != null ? (
          <Link to={prevPath} className={styles.headerNavButton}>
            PREV
          </Link>
        ) : null}
        {nextPath != null ? (
          <Link to={nextPath} className={styles.headerNavButton}>
            NEXT
          </Link>
        ) : null}
      </div>
      <div className={styles.headerRightSection}>
        <button
          className={styles.headerButton}
          onClick={onDirectionButtonClick}
        >
          {direction === DIRECTION_LEFT_TO_RIGHT ? (
            <IconLeft2Right className={styles.headerIcon} />
          ) : (
            <IconRight2Left className={styles.headerIcon} />
          )}
        </button>
        <button
          className={styles.headerButton}
          onClick={onReadingModeButtonClick}
        >
          <span className={styles.headerIconText}>{readingModeText}</span>
        </button>
      </div>
    </div>
  );
}

function Page(props) {
  const {
    index,
    pageHeight,
    pageWidth,
    publicURL,
    readingMode,
    windowHeight,
    windowWidth,
    onPageClick,
  } = props;
  const [imageBuffer, setImageBuffer] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const onceRef = useRef(false);
  const { ref, inView } = useInView({
    rootMargin: `${windowHeight * 2.5}px 0px ${windowHeight * 3.5}px`,
  });

  useEffect(() => {
    async function fetchImage() {
      const res = await fetchWithRetries(publicURL, 1000, 5);
      const buffer = await res.arrayBuffer();
      setImageBuffer(decryptBuffer(buffer));
    }
    if (inView && !onceRef.current) {
      fetchImage();
      onceRef.current = true;
    }
  }, [inView, publicURL]);

  useEffect(() => {
    if (inView) {
      setBlobUrl(createBlobUrl(imageBuffer));
    }

    return () => {
      if (blobUrl != null) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [imageBuffer, inView]);

  const windowRatio = windowHeight / windowWidth;
  const pageRatio = pageHeight / pageWidth;

  const shouldSpanWidth = readingMode !== READING_MODE_HEIGHT;

  const pageClassName = classnames(styles.page, {
    [styles.pageSpanWidth]: shouldSpanWidth,
    [styles.pageSpanHeight]: !shouldSpanWidth,
    [styles.pageWebtoon]: readingMode === READING_MODE_WEBTOON,
  });

  return (
    <div
      className={pageClassName}
      id={`page-${index}`}
      ref={ref}
      onClick={(e) => onPageClick(e, index)}
    >
      <div
        className={styles.pageWrapper}
        style={
          !shouldSpanWidth
            ? {
                width:
                  pageRatio < windowRatio ? "100%" : `${100 / pageRatio}vh`,
              }
            : undefined
        }
      >
        {shouldSpanWidth ? (
          <div
            className={styles.pagePadding}
            style={{
              paddingTop: `${pageRatio * 100}%`,
            }}
          />
        ) : null}
        {inView && blobUrl != null ? (
          <Image className={styles.pageImage} src={blobUrl} />
        ) : null}
      </div>
    </div>
  );
}
