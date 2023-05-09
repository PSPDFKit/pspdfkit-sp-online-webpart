import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { IPropertyPaneConfiguration } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import SnackbarProvider from "react-simple-snackbar";

import * as strings from "PSPDFKitWebPartStrings";
import PSPDFKitViewer from "./components/PSPDFKitViewer";
import {
  PropertyFieldFilePicker,
  IFilePickerResult,
} from "@pnp/spfx-property-controls/lib/PropertyFieldFilePicker";
import { getSP } from "../../pnpjsConfig";

export interface IPspdfSampleWebPartProps {
  description: string;
  filePickerResult: IFilePickerResult;
}

export default class PspdfSampleWebPart extends BaseClientSideWebPart<IPspdfSampleWebPartProps> {
  public render(): void {
    ReactDom.render(
      <SnackbarProvider>
        <PSPDFKitViewer
          documentURL={this.properties.filePickerResult.fileAbsoluteUrl}
        />
      </SnackbarProvider>,
      this.domElement
    );
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  public onInit(): Promise<void> {
    return super.onInit().then((_) => {
      getSP(this.context);
    });
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.PDFViewingGroupName,
              groupFields: [
                PropertyFieldFilePicker("filePicker", {
                  context: this.context as any,
                  filePickerResult: this.properties.filePickerResult,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  accepts: [".pdf", ".png", ".jpg", ".jpeg", ".tif", ".tiff"],
                  hideLinkUploadTab: true,
                  hideStockImages: true,
                  hideWebSearchTab: true,
                  hideRecentTab: true,
                  hideOrganisationalAssetTab: true,
                  hideOneDriveTab: true,
                  hideLocalUploadTab: true,
                  onSave: (e: IFilePickerResult) => {
                    this.properties.filePickerResult = e;
                  },
                  onChanged: (e: IFilePickerResult) => {
                    this.properties.filePickerResult = e;
                  },
                  key: "documentPicker",
                  buttonLabel: "Select Document",
                  label: "Document",
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
