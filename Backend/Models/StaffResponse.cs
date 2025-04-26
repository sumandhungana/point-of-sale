namespace Backend.Models;

public class StaffResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? Email { get; set; }
    public string? Remarks { get; set; }
    public string? ProfileImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<StaffSalaryResponse> StaffSalaries { get; set; } = new();
    public List<StaffAttendanceResponse> StaffAttendances { get; set; } = new();
}

public class StaffSalaryResponse
{
    public int Id { get; set; }
    public int StaffId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public DateTime SelectedDate { get; set; }
    public bool IsSlideOn { get; set; }
    public DateTime CalculationDate { get; set; }
    public string SalaryType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Permission { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class StaffAttendanceResponse
{
    public int Id { get; set; }
    public int StaffId { get; set; }
    public DateTime Date { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
} 