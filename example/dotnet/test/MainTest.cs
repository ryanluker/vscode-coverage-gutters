using Xunit;

namespace ExampleCode.Tests;

public class MainTest
{
    [Theory]
    [InlineData(1, 2, 3)]
    [InlineData(3, 2, 5)]
    public void AddTest(int x, int y, int expected)
    {
        Assert.Equal(expected, ExampleCode.MyApp.Add(x, y));
    }
}