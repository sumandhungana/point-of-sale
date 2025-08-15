using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class KhataBookContext : IKhataBookContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ApplicationDbContext _context;

    public KhataBookContext(IHttpContextAccessor httpContextAccessor, ApplicationDbContext context)
    {
        _httpContextAccessor = httpContextAccessor;
        _context = context;
    }

    public int GetCurrentKhataBookId()
    {
        // Try to get from session first
        var sessionKhataBookId = _httpContextAccessor.HttpContext?.Session.GetInt32("CurrentKhataBookId");
        if (sessionKhataBookId.HasValue && sessionKhataBookId > 0)
        {
            return sessionKhataBookId.Value;
        }

        // Try to get from header
        var headerValue = _httpContextAccessor.HttpContext?.Request.Headers["X-KhataBook-Id"].FirstOrDefault();
        if (!string.IsNullOrEmpty(headerValue) && int.TryParse(headerValue, out int headerKhataBookId) && headerKhataBookId > 0)
        {
            return headerKhataBookId;
        }

        // Get the currently selected KhataBook from database
        var selectedKhataBook = _context.KhataBooks.FirstOrDefault(k => k.IsUsed);
        if (selectedKhataBook != null)
        {
            return selectedKhataBook.Id;
        }

        // Fallback: get the first KhataBook if none is marked as used
        var firstKhataBook = _context.KhataBooks.OrderBy(k => k.Id).FirstOrDefault();
        if (firstKhataBook != null)
        {
            // Mark it as used for future requests
            firstKhataBook.IsUsed = true;
            _context.SaveChanges();
            return firstKhataBook.Id;
        }

        // Ultimate fallback (should never happen after migration)
        return 1;
    }

    public void SetCurrentKhataBookId(int khataBookId)
    {
        _httpContextAccessor.HttpContext?.Session.SetInt32("CurrentKhataBookId", khataBookId);
    }

    public async Task<bool> ValidateKhataBookAccess(int khataBookId)
    {
        return await _context.KhataBooks.AnyAsync(k => k.Id == khataBookId);
    }
}