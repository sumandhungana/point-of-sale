namespace Backend.Services;

public interface IKhataBookContext
{
    int GetCurrentKhataBookId();
    void SetCurrentKhataBookId(int khataBookId);
    Task<bool> ValidateKhataBookAccess(int khataBookId);
}