package com.puff.tech.covertor;

import com.puff.tech.entity.InvoiceSettingsEntity;
import com.puff.tech.usecase.invoicesettings.create.CreateInvoiceSettingsUseCaseRequest;
import com.puff.tech.usecase.invoicesettings.get.GetInvoiceSettingsUseCaseResponse;
import com.puff.tech.usecase.invoicesettings.update.UpdateInvoiceSettingsUseCaseRequest;

public class InvoiceSettingsConvertor {
    private InvoiceSettingsConvertor(){}

    public static InvoiceSettingsEntity toEntity(CreateInvoiceSettingsUseCaseRequest request,
                                                 Integer khataBookId){

        InvoiceSettingsEntity invoiceSettings= new InvoiceSettingsEntity();
        invoiceSettings.setKhataBookId(khataBookId);
        invoiceSettings.setPremiumBill(request.premiumBill());
        invoiceSettings.setThermalBill(request.thermalBill());
        invoiceSettings.setBasicBill(request.basicBill());
        invoiceSettings.setRegularPrinterField1(request.regularPrinterField1());
        invoiceSettings.setRegularPrinterField2(request.regularPrinterField2());
        invoiceSettings.setRegularPrinterField3(request.regularPrinterField3());
        invoiceSettings.setThermalPrinterField1(request.regularPrinterField1());
        invoiceSettings.setThermalPrinterField2(request.thermalPrinterField2());
        invoiceSettings.setThermalPrinterField3(request.thermalPrinterField3());
        invoiceSettings.setShowCompanyName(request.showCompanyName());
        invoiceSettings.setShowCompanyLogo(request.showCompanyLogo());
        invoiceSettings.setShowAddress(request.showAddress());
        invoiceSettings.setShowEmail(request.showEmail());
        invoiceSettings.setShowPhone(request.showPhone());
        invoiceSettings.setShowPanVat(request.showPanVat());
        invoiceSettings.setCompanyName(request.companyName());
        invoiceSettings.setCompanyLogo(request.companyLogo());
        invoiceSettings.setAddress(request.address());
        invoiceSettings.setEmail(request.email());
        invoiceSettings.setPhone(request.phone());
        invoiceSettings.setPanVat(request.panVat());
        invoiceSettings.setShowAuthorizedSignature(request.showAuthorizedSignature());
        invoiceSettings.setAuthorizedSignatureText(request.authorizedSignatureText());
        invoiceSettings.setChangeSignature(request.changeSignature());
        invoiceSettings.setPaperSize(request.paperSize());
        invoiceSettings.setOrientation(request.orientation());
        invoiceSettings.setCompanyTextSize(request.companyNameTextSize());
        invoiceSettings.setInvoiceTextSize(request.invoiceTaxSize());
        return invoiceSettings;

    }

    public static GetInvoiceSettingsUseCaseResponse toResponse(InvoiceSettingsEntity invoiceSettings){
        return new GetInvoiceSettingsUseCaseResponse(
                invoiceSettings.getId(),
                invoiceSettings.getPremiumBill(),
                invoiceSettings.getThermalBill(),
                invoiceSettings.getBasicBill(),
                invoiceSettings.getRegularPrinterField1(),
                invoiceSettings.getRegularPrinterField2(),
                invoiceSettings.getRegularPrinterField3(),
                invoiceSettings.getThermalPrinterField1(),
                invoiceSettings.getThermalPrinterField2(),
                invoiceSettings.getThermalPrinterField3(),
                invoiceSettings.isShowCompanyName(),
                invoiceSettings.isShowCompanyLogo(),
                invoiceSettings.isShowAddress(),
                invoiceSettings.isShowEmail(),
                invoiceSettings.isShowPhone(),
                invoiceSettings.isShowPanVat(),
                invoiceSettings.getCompanyName(),
                invoiceSettings.getCompanyLogo(),
                invoiceSettings.getAddress(),
                invoiceSettings.getEmail(),
                invoiceSettings.getPhone(),
                invoiceSettings.getPanVat(),
                invoiceSettings.isShowAuthorizedSignature(),
                invoiceSettings.getAuthorizedSignatureText(),
                invoiceSettings.getChangeSignature(),
                invoiceSettings.getPaperSize(),
                invoiceSettings.getOrientation(),
                invoiceSettings.getCompanyTextSize(),
                invoiceSettings.getInvoiceTextSize()
        );
    }

    public static InvoiceSettingsEntity toUpdateEntity(UpdateInvoiceSettingsUseCaseRequest request,
                                                       InvoiceSettingsEntity invoiceSettings){

        invoiceSettings.setPremiumBill(request.premiumBill());
        invoiceSettings.setThermalBill(request.thermalBill());
        invoiceSettings.setBasicBill(request.basicBill());
        invoiceSettings.setRegularPrinterField1(request.regularPrinterField1());
        invoiceSettings.setRegularPrinterField2(request.regularPrinterField2());
        invoiceSettings.setRegularPrinterField3(request.regularPrinterField3());
        invoiceSettings.setThermalPrinterField1(request.regularPrinterField1());
        invoiceSettings.setThermalPrinterField2(request.thermalPrinterField2());
        invoiceSettings.setThermalPrinterField3(request.thermalPrinterField3());
        invoiceSettings.setShowCompanyName(request.showCompanyName());
        invoiceSettings.setShowCompanyLogo(request.showCompanyLogo());
        invoiceSettings.setShowAddress(request.showAddress());
        invoiceSettings.setShowEmail(request.showEmail());
        invoiceSettings.setShowPhone(request.showPhone());
        invoiceSettings.setShowPanVat(request.showPanVat());
        invoiceSettings.setCompanyName(request.companyName());
        invoiceSettings.setCompanyLogo(request.companyLogo());
        invoiceSettings.setAddress(request.address());
        invoiceSettings.setEmail(request.email());
        invoiceSettings.setPhone(request.phone());
        invoiceSettings.setPanVat(request.panVat());
        invoiceSettings.setShowAuthorizedSignature(request.showAuthorizedSignature());
        invoiceSettings.setAuthorizedSignatureText(request.authorizedSignatureText());
        invoiceSettings.setChangeSignature(request.changeSignature());
        invoiceSettings.setPaperSize(request.paperSize());
        invoiceSettings.setOrientation(request.orientation());
        invoiceSettings.setCompanyTextSize(request.companyNameTextSize());
        invoiceSettings.setInvoiceTextSize(request.invoiceTaxSize());
        return invoiceSettings;

    }
}
