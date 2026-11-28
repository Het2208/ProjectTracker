using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Project_Tracker_Backend.Controllers;
using System.Reflection;
using Xunit;

namespace Project_Tracker_Backend.test
{
    public class RouteConfigurationTests
    {
        [Fact]
        public void UserController_LoginAction_HasUniqueRouteMapping()
        {
            var controllerType = typeof(UserController);
            var classRoutes = controllerType.GetCustomAttributes<RouteAttribute>().Select(r => r.Template).ToList();

            // Find all methods named Login
            var loginMethods = controllerType.GetMethods(BindingFlags.Public | BindingFlags.Instance)
                .Where(m => m.Name == "Login" || m.GetCustomAttribute<ActionNameAttribute>()?.Name == "login")
                .ToList();

            Assert.Single(loginMethods);
            var loginMethod = loginMethods.First();

            // Check HttpPost attributes
            var httpPostAttrs = loginMethod.GetCustomAttributes<HttpPostAttribute>().ToList();
            Assert.Single(httpPostAttrs);

            // Calculate distinct effective route templates
            var postAttr = httpPostAttrs.First();
            var actionRouteTemplates = new List<string>();

            foreach (var classRoute in classRoutes)
            {
                var actionSegment = loginMethod.GetCustomAttribute<ActionNameAttribute>()?.Name ?? loginMethod.Name;
                var resolvedClassRoute = classRoute
                    .Replace("[controller]", "User", StringComparison.OrdinalIgnoreCase)
                    .Replace("[action]", actionSegment, StringComparison.OrdinalIgnoreCase);

                if (string.IsNullOrEmpty(postAttr.Template))
                {
                    actionRouteTemplates.Add(resolvedClassRoute);
                }
                else
                {
                    actionRouteTemplates.Add($"{resolvedClassRoute}/{postAttr.Template}");
                }
            }

            // Verify that "/api/User/login" is produced exactly once
            var matchingLoginEndpoints = actionRouteTemplates
                .Where(r => r.Equals("api/User/login", StringComparison.OrdinalIgnoreCase))
                .ToList();

            Assert.Single(matchingLoginEndpoints);
        }

        [Fact]
        public void UserController_RegisterAction_HasUniqueRouteMapping()
        {
            var controllerType = typeof(UserController);
            var classRoutes = controllerType.GetCustomAttributes<RouteAttribute>().Select(r => r.Template).ToList();

            var registerMethods = controllerType.GetMethods(BindingFlags.Public | BindingFlags.Instance)
                .Where(m => m.Name == "Register" || m.GetCustomAttribute<ActionNameAttribute>()?.Name == "register")
                .ToList();

            Assert.Single(registerMethods);
            var registerMethod = registerMethods.First();

            var httpPostAttrs = registerMethod.GetCustomAttributes<HttpPostAttribute>().ToList();
            Assert.Single(httpPostAttrs);

            var postAttr = httpPostAttrs.First();
            var actionRouteTemplates = new List<string>();

            foreach (var classRoute in classRoutes)
            {
                var actionSegment = registerMethod.GetCustomAttribute<ActionNameAttribute>()?.Name ?? registerMethod.Name;
                var resolvedClassRoute = classRoute
                    .Replace("[controller]", "User", StringComparison.OrdinalIgnoreCase)
                    .Replace("[action]", actionSegment, StringComparison.OrdinalIgnoreCase);

                if (string.IsNullOrEmpty(postAttr.Template))
                {
                    actionRouteTemplates.Add(resolvedClassRoute);
                }
                else
                {
                    actionRouteTemplates.Add($"{resolvedClassRoute}/{postAttr.Template}");
                }
            }

            var matchingRegisterEndpoints = actionRouteTemplates
                .Where(r => r.Equals("api/User/register", StringComparison.OrdinalIgnoreCase))
                .ToList();

            Assert.Single(matchingRegisterEndpoints);
        }

        [Fact]
        public void AllControllers_NoActionHasDuplicateHttpAttributesOfSameMethod()
        {
            var assembly = typeof(UserController).Assembly;
            var controllers = assembly.GetTypes()
                .Where(t => typeof(ControllerBase).IsAssignableFrom(t) && !t.IsAbstract)
                .ToList();

            foreach (var controller in controllers)
            {
                var actions = controller.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly);

                foreach (var action in actions)
                {
                    var httpMethodAttributes = action.GetCustomAttributes()
                        .Where(a => a is HttpMethodAttribute)
                        .Cast<HttpMethodAttribute>()
                        .ToList();

                    // Group by HTTP method (e.g. POST, GET)
                    var duplicateMethods = httpMethodAttributes
                        .GroupBy(a => a.HttpMethods.FirstOrDefault() ?? "ANY")
                        .Where(g => g.Count() > 1)
                        .Select(g => g.Key)
                        .ToList();

                    Assert.True(!duplicateMethods.Any(),
                        $"Action '{action.Name}' on controller '{controller.Name}' has duplicate attributes for HTTP method: {string.Join(", ", duplicateMethods)}");
                }
            }
        }
    }
}
