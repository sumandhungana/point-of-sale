using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Helpers;
using Microsoft.AspNetCore.Http;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ItemController> _logger;

    public ItemController(ApplicationDbContext context, ILogger<ItemController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/Item
    [HttpGet]
    public async Task<ActionResult<ItemsResponseDto>> GetItems()
    {
        var items = await _context.Items
            .Include(i => i.Category)
            .ToListAsync();

        var response = new ItemsResponseDto
        {
            Items = items,
            TotalSalesPrice = items.Where(i => i.SalesPrice.HasValue).Sum(i => i.SalesPrice ?? 0),
            TotalItems = items.Count
        };

        return response;
    }

    // GET: api/Item/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Item>> GetItem(int id)
    {
        var item = await _context.Items
            .Include(i => i.Category)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            return NotFound();
        }

        return item;
    }

    // POST: api/Item
    [HttpPost]
    public async Task<ActionResult<Item>> CreateItem([FromForm] ItemCreateDto itemDto)
    {
        try
        {
            var item = new Item
            {
                Name = itemDto.Name,
                CategoryId = itemDto.CategoryId,
                SalesPrice = itemDto.SalesPrice,
                PurchasePrice = itemDto.PurchasePrice,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            if (itemDto.Image != null)
            {
                item.ImageUrl = await FileUploadHelper.UploadFileAsync(itemDto.Image, _logger);
            }

            _context.Items.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating item");
            return BadRequest(ex.Message);
        }
    }

    // PUT: api/Item/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateItem(int id, [FromForm] ItemUpdateDto itemDto)
    {
        try
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.Name = itemDto.Name;
            item.CategoryId = itemDto.CategoryId;
            item.SalesPrice = itemDto.SalesPrice;
            item.PurchasePrice = itemDto.PurchasePrice;
            item.UpdatedAt = DateTime.UtcNow;

            if (itemDto.Image != null)
            {
                // Delete old image if exists
                if (!string.IsNullOrEmpty(item.ImageUrl))
                {
                    FileUploadHelper.DeleteFile(item.ImageUrl);
                }
                // Upload new image
                item.ImageUrl = await FileUploadHelper.UploadFileAsync(itemDto.Image, _logger);
            }

            _context.Entry(item).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating item");
            return BadRequest(ex.Message);
        }
    }

    // DELETE: api/Item/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        // Delete associated image file
        if (!string.IsNullOrEmpty(item.ImageUrl))
        {
            FileUploadHelper.DeleteFile(item.ImageUrl);
        }

        _context.Items.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ItemExists(int id)
    {
        return _context.Items.Any(e => e.Id == id);
    }
}

public class ItemCreateDto
{
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public decimal SalesPrice { get; set; }
    public decimal PurchasePrice { get; set; }
    public IFormFile? Image { get; set; }
}

public class ItemUpdateDto
{
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public decimal SalesPrice { get; set; }
    public decimal PurchasePrice { get; set; }
    public IFormFile? Image { get; set; }
}

public class ItemsResponseDto
{
    public List<Item> Items { get; set; } = new();
    public decimal TotalSalesPrice { get; set; }
    public int TotalItems { get; set; }
} 