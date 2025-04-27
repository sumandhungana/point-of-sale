using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class KhataBook
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        // Personal Info
        [Required]
        [StringLength(255)]
        public string Name { get; set; }

        [StringLength(20)]
        public string Number { get; set; }

        public string Address { get; set; }

        [StringLength(255)]
        public string Email { get; set; }

        // Business Info
        [StringLength(255)]
        public string CompanyName { get; set; }

        [StringLength(20)]
        public string CompanyNumber { get; set; }

        public string CompanyAddress { get; set; }

        [StringLength(255)]
        public string CompanyEmail { get; set; }

        public BusinessCategory BusinessCategory { get; set; }

        public BusinessType BusinessType { get; set; }

        // Financial Info
        public bool TaxVat { get; set; }

        public bool BookAccount { get; set; }

        public bool Kyc { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public enum BusinessCategory
    {
        Retail,
        Wholesale,
        Manufacturing,
        Service
    }

    public enum BusinessType
    {
        Sole,
        Partnership,
        Corporation,
        Llc
    }
} 