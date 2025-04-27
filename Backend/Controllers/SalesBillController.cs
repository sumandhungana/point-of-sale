using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Helpers;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesBillController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SalesBillController> _logger;

    public SalesBillController(ApplicationDbContext context, ILogger<SalesBillController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/SalesBill
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SalesBill>>> GetSalesBills()
    {
        return await _context.SalesBills
            .Include(s => s.Customer)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    // GET: api/SalesBill/5
    [HttpGet("{id}")]
    public async Task<ActionResult<SalesBill>> GetSalesBill(int id)
    {
        var salesBill = await _context.SalesBills
            .Include(s => s.Customer)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (salesBill == null)
        {
            return NotFound();
        }

        return salesBill;
    }

    // POST: api/SalesBill
    [HttpPost]
    public async Task<ActionResult<SalesBill>> CreateSalesBill([FromBody] SalesBillRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            string photoPath = null;
            if (!string.IsNullOrEmpty(request.Base64Image))
            {
                try
                {
                    // Convert base64 to IFormFile
                    var formFile = await ConvertBase64ToFormFile(request.Base64Image);
                    if (formFile != null)
                    {
                        photoPath = await FileUploadHelper.UploadFileAsync(formFile, _logger);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing base64 image");
                    return BadRequest("Invalid image data");
                }
            }

            var salesBill = new SalesBill
            {
                BillNumber = request.BillNumber,
                BillDate = request.BillDate.ToUniversalTime(),
                CustomerId = request.CustomerId,
                PaymentMode = request.PaymentMode,
                Amount = request.Amount,
                Remarks = request.Remarks,
                PhotoPath = photoPath,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.SalesBills.Add(salesBill);
            await _context.SaveChangesAsync();

            // Include customer details in the response
            var response = await _context.SalesBills
                .Include(s => s.Customer)
                .FirstOrDefaultAsync(s => s.Id == salesBill.Id);

            return CreatedAtAction(nameof(GetSalesBill), new { id = salesBill.Id }, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating sales bill");
            return BadRequest(ex.Message);
        }
    }

    // PUT: api/SalesBill/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSalesBill(int id, [FromBody] SalesBillUpdateDto salesBillDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var salesBill = await _context.SalesBills.FindAsync(id);
            if (salesBill == null)
            {
                return NotFound();
            }

            // Handle image update
            if (!string.IsNullOrEmpty(salesBillDto.Base64Image))
            {
                try
                {
                    // Delete old photo if exists
                    if (!string.IsNullOrEmpty(salesBill.PhotoPath))
                    {
                        FileUploadHelper.DeleteFile(salesBill.PhotoPath);
                    }

                    // Convert base64 to IFormFile and upload
                    var formFile = await ConvertBase64ToFormFile(salesBillDto.Base64Image);
                    if (formFile != null)
                    {
                        salesBill.PhotoPath = await FileUploadHelper.UploadFileAsync(formFile, _logger);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing base64 image");
                    return BadRequest("Invalid image data");
                }
            }

            salesBill.BillNumber = salesBillDto.BillNumber;
            salesBill.BillDate = salesBillDto.BillDate.ToUniversalTime();
            salesBill.CustomerId = salesBillDto.CustomerId;
            salesBill.PaymentMode = salesBillDto.PaymentMode;
            salesBill.Amount = salesBillDto.Amount;
            salesBill.Remarks = salesBillDto.Remarks;
            salesBill.UpdatedAt = DateTime.UtcNow;

            _context.Entry(salesBill).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(salesBill);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating sales bill");
            return BadRequest(ex.Message);
        }
    }

    // DELETE: api/SalesBill/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSalesBill(int id)
    {
        var salesBill = await _context.SalesBills.FindAsync(id);
        if (salesBill == null)
        {
            return NotFound();
        }

        // Delete associated photo if exists
        if (!string.IsNullOrEmpty(salesBill.PhotoPath))
        {
            FileUploadHelper.DeleteFile(salesBill.PhotoPath);
        }

        _context.SalesBills.Remove(salesBill);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<IFormFile> ConvertBase64ToFormFile(string base64String)
    {
        try
        {
            // Remove the data URL prefix if present
            var base64Data = base64String.Contains(",") 
                ? base64String.Split(',')[1] 
                : base64String;

            // Decode base64 string
            var bytes = Convert.FromBase64String(base64Data);

            // Create a memory stream from the bytes
            var stream = new MemoryStream(bytes);

            // Create a form file
            var formFile = new FormFile(
                stream,
                0,
                bytes.Length,
                "image",
                $"image_{Guid.NewGuid()}.jpg"
            );

            return formFile;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error converting base64 to form file");
            throw;
        }
    }

    private bool SalesBillExists(int id)
    {
        return _context.SalesBills.Any(e => e.Id == id);
    }
}

public class SalesBillRequest
{
    [Required(ErrorMessage = "Bill number is required")]
    [StringLength(100)]
    public string BillNumber { get; set; } = null!;
    
    [Required]
    public DateTime BillDate { get; set; }
    
    [Required]
    public int CustomerId { get; set; }
    
    [Required(ErrorMessage = "Payment mode is required")]
    [StringLength(10)]
    public string PaymentMode { get; set; } = null!;
    
    [Required]
    public decimal Amount { get; set; }
    
    public string? Remarks { get; set; }
    
    public string? Base64Image { get; set; }
}

public class SalesBillUpdateDto
{
    [Required(ErrorMessage = "Bill number is required")]
    [StringLength(100)]
    public string BillNumber { get; set; } = null!;
    
    [Required]
    public DateTime BillDate { get; set; }
    
    [Required]
    public int CustomerId { get; set; }
    
    [Required(ErrorMessage = "Payment mode is required")]
    [StringLength(10)]
    public string PaymentMode { get; set; } = null!;
    
    [Required]
    public decimal Amount { get; set; }
    
    public string? Remarks { get; set; }
    
    public string? Base64Image { get; set; }
} 