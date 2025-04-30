namespace Backend.Models
{
    public class KhataBookCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Number { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string CompanyNumber { get; set; } = string.Empty;
        public string CompanyAddress { get; set; } = string.Empty;
        public string CompanyEmail { get; set; } = string.Empty;
        public string BusinessCategory { get; set; } = string.Empty;
        public string BusinessType { get; set; } = string.Empty;
        public bool TaxVat { get; set; }
        public bool BookAccount { get; set; }
        public bool KYC { get; set; }
    }
} 