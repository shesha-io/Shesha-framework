﻿using Abp.Application.Services;
using Abp.AspNetCore.Mvc.Extensions;
using Abp.Modules;
using Abp.Reflection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Shesha.ConfigurationItems;
using Shesha.Extensions;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Module = Shesha.Domain.ConfigurationItems.Module;

namespace Shesha.Permissions
{
    public class ApiPermissionedObjectProvider : PermissionedObjectProviderBase, IPermissionedObjectProvider
    {

        private readonly IApiDescriptionGroupCollectionProvider _apiDescriptionsProvider;
        private readonly IModuleManager _moduleManager;

        public ApiPermissionedObjectProvider(
            IAssemblyFinder assembleFinder,
            IApiDescriptionGroupCollectionProvider apiDescriptionsProvider,
            IModuleManager moduleManager
            ) : base(assembleFinder)
        {
            _apiDescriptionsProvider = apiDescriptionsProvider;
            _moduleManager = moduleManager;
        }

        public List<string> GetObjectTypes()
        {
            return new List<string>() { ShaPermissionedObjectsTypes.WebApi, ShaPermissionedObjectsTypes.WebCrudApi };
        }

        private bool IsCrud(Type type)
        {
            if (type.Name.Contains("Crud"))
                return true;
            if (type.BaseType != null)
                return IsCrud(type.BaseType);
            return false;
        }

        public string GetObjectType(Type type)
        {
            var shaServiceType = typeof(ApplicationService);
            var controllerType = typeof(ControllerBase);

            return !(type.IsPublic && !type.IsAbstract
                                 && (shaServiceType.IsAssignableFrom(type) || controllerType.IsAssignableFrom(type)))
                   ? null // if not controller
                   : IsCrud(type)
                        ? ShaPermissionedObjectsTypes.WebCrudApi
                        : ShaPermissionedObjectsTypes.WebApi;
        }

        private string GetMethodType(string parentType)
        {
            return parentType == ShaPermissionedObjectsTypes.WebApi
                ? ShaPermissionedObjectsTypes.WebApiAction
                : parentType == ShaPermissionedObjectsTypes.WebCrudApi
                    ? ShaPermissionedObjectsTypes.WebCrudApiAction
                    : null;
        }

        private Type GetModuleOfType(Type type)
        {
            return type.Assembly.GetTypes().FirstOrDefault(t => t.IsPublic && !t.IsAbstract && typeof(AbpModule).IsAssignableFrom(t));
        }

        private Dictionary<Assembly, Module> _modules = new Dictionary<Assembly, Module>();

        private async Task<Module> GetModuleOfAssemblyAsync(Assembly assembly)
        {
            Module module = null;
            if (_modules.TryGetValue(assembly, out module))
            {
                return module;
            }
            module = await _moduleManager.GetOrCreateModuleAsync(assembly);
            _modules.Add(assembly, module);
            return module;
        }

        private string GetMd5(PermissionedObjectDto dto)
        {
            return $"{dto.ModuleId}|{dto.Parent}|{dto.Name}|{string.Join("|", dto.AdditionalParameters.Select(x => x.Key + "@" + x.Value))}"
                .ToMd5Fingerprint();
        }

        public async Task<List<PermissionedObjectDto>> GetAllAsync(string objectType = null)
        {
            if (objectType != null && !GetObjectTypes().Contains(objectType)) return new List<PermissionedObjectDto>();

            var api = (await _apiDescriptionsProvider.ApiDescriptionGroups.Items.SelectManyAsync(async g => await g.Items.SelectAsync(async a =>
            {
                var descriptor = a.ActionDescriptor.AsControllerActionDescriptor();
                var module = GetModuleOfType(descriptor.ControllerTypeInfo.AsType());
                return new ApiDescriptor()
                {
                    Description = a,
                    Module = await GetModuleOfAssemblyAsync(module.Assembly),
                    Service = descriptor.ControllerTypeInfo.AsType(),
                    HttpMethod = a.HttpMethod,
                    Endpoint = a.RelativePath,
                    Action = descriptor.MethodInfo
                };
            }))).ToList();

            var allApiPermissions = new List<PermissionedObjectDto>();

            var modules = api.Select(x => x.Module).Distinct().ToList();
            foreach (var module in modules)
            {
                var services = api.Where(a => a.Module == module).Select(x => x.Service).Distinct().ToList();

                foreach (var service in services)
                {
                    var isDynamic = service.GetInterfaces().Any(x =>
                        x.IsGenericType &&
                        x.GetGenericTypeDefinition() == typeof(IDynamicCrudAppService<,,>));

                    var objType = isDynamic
                        ? ShaPermissionedObjectsTypes.WebCrudApi
                        : ShaPermissionedObjectsTypes.WebApi;

                    if (objectType != null && objType != objectType) continue;

                    if (objType == ShaPermissionedObjectsTypes.WebCrudApi)
                        continue;

                    var serviceName = service.Name;
                    serviceName = serviceName.EndsWith("AppService")
                        ? serviceName.Replace("AppService", "")
                        : serviceName;
                    serviceName = serviceName.EndsWith("Controller")
                        ? serviceName.Replace("Controller", "")
                        : serviceName;

                    var parent = new PermissionedObjectDto()
                    {
                        Object = service.FullName,
                        ModuleId = module?.Id,
                        Module = module?.Name,
                        Name = GetName(service, serviceName),
                        Type = objType,
                        Description = GetDescription(service),
                    };
                    parent.Md5 = GetMd5(parent);
                    allApiPermissions.Add(parent);

                    var methods = api.Where(a => a.Module == module && a.Service == service).ToList();

                    foreach (var methodInfo in methods)
                    {
                        var methodName = methodInfo.Action.Name.RemovePostfix("Async");

                        var child = new PermissionedObjectDto()
                        {
                            Object = parent.Object + "@" + methodName,
                            Module = parent.Module,
                            ModuleId = parent.ModuleId,
                            Name = GetName(methodInfo.Action, methodName),
                            Type = GetMethodType(objType),
                            Parent = parent.Object,
                            Description = GetDescription(methodInfo.Action),
                        };

                        child.AdditionalParameters.Add("HttpMethod", methodInfo.HttpMethod);
                        child.AdditionalParameters.Add("Endpoint", methodInfo.Endpoint);

                        //parent.Child.Add(child);
                        child.Md5 = GetMd5(child);
                        allApiPermissions.Add(child);
                    }
                }
            }

            return allApiPermissions;
        }

        private class ApiDescriptor
        {
            public ApiDescription Description { get; set; }
            public Module Module { get; set; }
            public Type Service { get; set; }
            public MethodInfo Action { get; set; }
            public string HttpMethod { get; set; }
            public string Endpoint { get; set; }

        }
    }
}