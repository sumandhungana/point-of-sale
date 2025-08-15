using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CategoryController> _logger;
    private readonly IKhataBookContext _khataBookContext;

    public CategoryController(ApplicationDbContext context, ILogger<CategoryController> logger, IKhataBookContext khataBookContext)
    {
        _context = context;
        _logger = logger;
        _khataBookContext = khataBookContext;
    }

    // GET: api/Category
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.Categories
            .Where(c => c.KhataBookId == currentKhataBookId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Category/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Category>> GetCategory(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.KhataBookId == currentKhataBookId);

        if (category == null)
        {
            return NotFound();
        }

        return category;
    }

    // POST: api/Category
    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory(CreateCategoryDto categoryDto)
    {
        var category = new Category
        {
            KhataBookId = _khataBookContext.GetCurrentKhataBookId(),
            Name = categoryDto.Name,
            Description = categoryDto.Description,
            CategoryType = categoryDto.CategoryType,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        _context.Categories.Add(category);
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error creating category");
            throw;
        }

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
    }

    // PUT: api/Category/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, Category category)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var existingCategory = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.KhataBookId == currentKhataBookId);
        
        if (existingCategory == null)
        {
            return NotFound();
        }

        existingCategory.Name = category.Name;
        existingCategory.Description = category.Description;
        existingCategory.CategoryType = category.CategoryType;
        existingCategory.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CategoryExists(id))
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

    // DELETE: api/Category/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.KhataBookId == currentKhataBookId);
        if (category == null)
        {
            return NotFound();
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CategoryExists(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return _context.Categories.Any(e => e.Id == id && e.KhataBookId == currentKhataBookId);
    }
} 