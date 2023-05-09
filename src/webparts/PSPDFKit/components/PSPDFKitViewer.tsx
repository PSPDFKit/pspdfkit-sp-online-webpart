import * as React from "react";
import "@pnp/sp/webs";
import "@pnp/sp/files";
import "@pnp/sp/folders";

import { useSnackbar } from "react-simple-snackbar";
import styles from "./PSPDFKitViewer.module.scss";
import { getSP } from "../../../pnpjsConfig";

export default function PSPDFKitViewer(props: IPSPDFKitViewerProps) {
  const containerRef = React.useRef(null);
  const [documentURL, setDocumentURL] = React.useState(props.documentURL);
  const [openSnackbar] = useSnackbar();

  React.useEffect(() => {
    if (!documentURL) {
      return;
    }
    const container = containerRef.current;
    let instance, PSPDFKit, restoreBlobDownloadInterception;

    (async () => {
      console.log("Will load PSPDFKit instance");

      PSPDFKit = await import("pspdfkit");

      const saveItem = {
        type: "custom",
        title: "Save",
        async onPress() {
          openSnackbar("Updating content...");
          const fileContent = await instance.exportPDF();
          const sp = getSP();
          const file = sp.web.getFileByUrl(documentURL);

          await file.setContent(fileContent);
          openSnackbar("Content updated.");
        },
      };

      instance = await PSPDFKit.load({
        // Container where PSPDFKit should be mounted.
        container,
        // The document to open.
        document: documentURL,
        toolbarItems: [
          ...PSPDFKit.defaultToolbarItems,
          saveItem,
        ],
      });

      restoreBlobDownloadInterception = disableBlobDownloadInterception();
    })();

    return () => PSPDFKit && PSPDFKit.unload(container) && restoreBlobDownloadInterception();
  }, [documentURL]);

  React.useEffect(() => {
    setDocumentURL(props.documentURL);
  }, [props.documentURL]);

  return (
    <div className="App">
      {documentURL ? (
        <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />
      ) : (
        <div className={styles.placeholderWrapper}>
          <p>
            Select a PDF document from your libraries, and people can view and
            edit them with PSPDFKit without leaving your page.
          </p>
        </div>
      )}
    </div>
  );
}
export interface IPSPDFKitViewerProps {
  documentURL: string;
}

function disableBlobDownloadInterception() {
  function disableBlobDownloadInterceptionInLink() {
    (event: MouseEvent) => {
      if (
        (event.target as Element).nodeName === "A" &&
        (event.target as HTMLElement).hasAttribute("download")
      ) {
        (event.target as HTMLAnchorElement).dataset.interception = "off";
      }
    }
  }
  document.addEventListener("click", disableBlobDownloadInterceptionInLink);

  return () => document.removeEventListener("click", disableBlobDownloadInterceptionInLink);
}

