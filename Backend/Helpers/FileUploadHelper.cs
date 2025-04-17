using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Backend.Helpers;

public static class FileUploadHelper
{
    private static readonly string UploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif" };

    public static async Task<string> UploadFileAsync(IFormFile file, ILogger logger)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("No file was uploaded");
            }

            // Create uploads directory if it doesn't exist
            if (!Directory.Exists(UploadsFolder))
            {
                Directory.CreateDirectory(UploadsFolder);
            }

            // Validate file extension
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
            {
                throw new ArgumentException("Invalid file type. Only images are allowed.");
            }

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(UploadsFolder, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return relative URL path
            return $"/uploads/{fileName}";
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error uploading file");
            throw;
        }
    }

    public static void DeleteFile(string fileUrl)
    {
        try
        {
            if (string.IsNullOrEmpty(fileUrl))
            {
                return;
            }

            var fileName = Path.GetFileName(fileUrl);
            var filePath = Path.Combine(UploadsFolder, fileName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
        catch (Exception ex)
        {
            // Log error but don't throw to prevent breaking the main operation
            Console.WriteLine($"Error deleting file: {ex.Message}");
        }
    }
} 