using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RentalItemController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<RentalItemController> _logger;
    private readonly IKhataBookContext _khataBookContext;

    public RentalItemController(ApplicationDbContext context, ILogger<RentalItemController> logger, IKhataBookContext khataBookContext)
    {
        _context = context;
        _logger = logger;
        _khataBookContext = khataBookContext;
    }

    // GET: api/RentalItem
    [HttpGet]
    public async Task<ActionResult<RentalItemResponseDto>> GetRentalItems()
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var rentalItems = await _context.RentalItems
            .Where(r => r.KhataBookId == currentKhataBookId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
        var response = new RentalItemResponseDto
        {
            RentalItem = rentalItems,
            youGive = 234,
            advanceAmount = 435
        };
        return response;
    }

    // GET: api/RentalItem/5
    [HttpGet("{id}")]
    public async Task<ActionResult<RentalItem>> GetRentalItem(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var rentalItem = await _context.RentalItems
            .FirstOrDefaultAsync(r => r.Id == id && r.KhataBookId == currentKhataBookId);

        if (rentalItem == null)
        {
            return NotFound();
        }

        return rentalItem;
    }

    // POST: api/RentalItem
    [HttpPost]
    public async Task<ActionResult<RentalItem>> CreateRentalItem(CreateRentalItemDto rentalItemDto)
    {
        var rentalItem = new RentalItem
        {
            KhataBookId = _khataBookContext.GetCurrentKhataBookId(),
            RentalItemName = rentalItemDto.RentalItemName,
            PhoneNumber = rentalItemDto.PhoneNumber,
            Address = rentalItemDto.Address,
            RentalAmount = rentalItemDto.RentalAmount,
            RentalPeriod = rentalItemDto.RentalPeriod,
            StartDate = rentalItemDto.StartDate,
            EndDate = rentalItemDto.EndDate,
            Remarks = rentalItemDto.Remarks,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        _context.RentalItems.Add(rentalItem);
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error creating rental item");
            throw;
        }

        return CreatedAtAction(nameof(GetRentalItem), new { id = rentalItem.Id }, rentalItem);
    }

    // PUT: api/RentalItem/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRentalItem(int id, RentalItem rentalItem)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var existingRentalItem = await _context.RentalItems
            .FirstOrDefaultAsync(r => r.Id == id && r.KhataBookId == currentKhataBookId);
        
        if (existingRentalItem == null)
        {
            return NotFound();
        }

        existingRentalItem.RentalItemName = rentalItem.RentalItemName;
        existingRentalItem.PhoneNumber = rentalItem.PhoneNumber;
        existingRentalItem.Address = rentalItem.Address;
        existingRentalItem.RentalAmount = rentalItem.RentalAmount;
        existingRentalItem.RentalPeriod = rentalItem.RentalPeriod;
        existingRentalItem.StartDate = rentalItem.StartDate;
        existingRentalItem.EndDate = rentalItem.EndDate;
        existingRentalItem.Remarks = rentalItem.Remarks;
        existingRentalItem.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!RentalItemExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/RentalItem/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRentalItem(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var rentalItem = await _context.RentalItems
            .FirstOrDefaultAsync(r => r.Id == id && r.KhataBookId == currentKhataBookId);
        if (rentalItem == null)
        {
            return NotFound();
        }

        _context.RentalItems.Remove(rentalItem);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool RentalItemExists(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return _context.RentalItems.Any(e => e.Id == id && e.KhataBookId == currentKhataBookId);
    }
} 

public class RentalItemResponseDto
{
    public List<RentalItem> RentalItem { get; set; } = new();
    public decimal youGive { get; set; }
    public decimal advanceAmount { get; set; }
}