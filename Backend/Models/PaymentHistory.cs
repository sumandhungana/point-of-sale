using System;

namespace Backend.Models
{
    public class PaymentHistory
    {
        public int Id { get; set; }
        public int PartyId { get; set; }
        public string? PartyName { get; set; }
        public decimal Amount { get; set; }
        public string? Remarks { get; set; }
        public DateTime Date { get; set; }
        public string? BillPath { get; set; }
        public string? Type { get; set; } // "Given" or "Received"
        public decimal OldBalance { get; set; }
        public decimal NewBalance { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set;}
    }
} 