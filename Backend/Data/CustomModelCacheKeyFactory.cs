using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Backend.Data;

internal sealed class CustomModelCacheKeyFactory : IModelCacheKeyFactory
{
    private readonly ModelCacheKeyFactoryDependencies _dependencies;

    public CustomModelCacheKeyFactory(ModelCacheKeyFactoryDependencies dependencies)
    {
        _dependencies = dependencies;
    }

    public object Create(DbContext context, bool designTime)
    {
        if (designTime)
        {
            return new ModelCacheKey(context);
        }
        return new CustomModelCacheKey(context);
    }

    public object Create(DbContext context, bool designTime, bool providerDesignTime)
    {
        if (designTime || providerDesignTime)
        {
            return new ModelCacheKey(context);
        }
        return new CustomModelCacheKey(context);
    }
}

internal sealed class CustomModelCacheKey : ModelCacheKey
{
    private readonly string? _schema;

    public CustomModelCacheKey(DbContext context) 
        : base(context)
    {
        _schema = (context as ApplicationDbContext)?.GetCurrentSchema();
    }

    protected override bool Equals(ModelCacheKey other)
    {
        if (!base.Equals(other))
            return false;

        if (other is not CustomModelCacheKey otherKey)
            return false;

        return string.Equals(_schema, otherKey._schema, StringComparison.Ordinal);
    }

    public override int GetHashCode()
    {
        var hashCode = base.GetHashCode();
        if (_schema != null)
        {
            hashCode = (hashCode * 397) ^ _schema.GetHashCode(StringComparison.Ordinal);
        }
        return hashCode;
    }
} 