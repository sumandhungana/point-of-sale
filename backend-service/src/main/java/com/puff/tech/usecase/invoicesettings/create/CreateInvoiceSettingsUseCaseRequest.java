package com.puff.tech.usecase.invoicesettings.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateInvoiceSettingsUseCaseRequest(
        String premiumBill,
        String thermalBill,
        String basicBill,

        String regularPrinterField1,
        String regularPrinterField2,
        String regularPrinterField3,

        String thermalPrinterField1,
        String thermalPrinterField2,
        String thermalPrinterField3,

        Boolean showCompanyName,
        Boolean showCompanyLogo,
        Boolean showAddress,
        Boolean showEmail,
        Boolean showPhone,
        Boolean showPanVat,

        String companyName,
        String companyLogo,
        String address,
        String email,
        String phone,
        String panVat,

        Boolean showAuthorizedSignature,
        String authorizedSignatureText,
        String changeSignature,

        String paperSize,
        String orientation,

        String companyNameTextSize,
        String invoiceTaxSize
)
implements UseCases.UseCaseRequest {
}
