﻿using Microsoft.AspNetCore.Mvc.Abstractions;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Permissions
{
    public interface IPermissionedObjectManager
    {
        /// <summary>
        /// Get category of Protected Object for Type or NULL if not protected
        /// </summary>
        /// <param name="type">Type</param>
        /// <returns></returns>
        string GetObjectType(Type type);

        /// <summary>
        /// Get list of protected objects
        /// </summary>
        /// <param name="type"></param>
        /// <param name="withNested"></param>
        /// <param name="withHidden">Show hidden protected objects</param>
        /// <returns></returns>
        Task<List<PermissionedObjectDto>> GetAllFlatAsync(string type = null, bool withNested = true, bool withHidden = false);

        /// <summary>
        /// Get hierarchical list of protected objects
        /// </summary>
        /// <param name="type"></param>
        /// <param name="withHidden">Show hidden protected objects</param>
        /// <returns></returns>
        List<PermissionedObjectDto> GetAllTree(string type, bool withHidden);

        /// <summary>
        /// Get Protected Object by object name with children
        /// </summary>
        PermissionedObjectDto GetObjectWithChild(string type, bool withHidden);

        /// <summary>
        /// Get Protected Object by object name
        /// </summary>
        /// <param name="objectName">Object name for search Protected Object (usually it has format "type@action")</param>
        /// <param name="objectType"></param>
        /// <param name="inheritedFromName">Name of parent object </param>
        /// <param name="useInherited">Get permission data from parent if inherited</param>

        /// <param name="useHidden">Allow to get permission data from hidden protected objects</param>
        /// <returns></returns>
        Task<PermissionedObjectDto> GetOrCreateAsync(string objectName, string objectType, string inheritedFromName = null,
            bool useInherited = true, bool useHidden = false);

        /// <summary>
        /// Get Protected Object by object name
        /// </summary>
        /// <param name="objectName">Object name for search Protected Object (usually it has format "type@action")</param>
        /// <param name="objectType">Object type for search Protected Object</param>
        /// <param name="useInherited">Get permission data from parent if inherited</param>
        /// <param name="useHidden">Allow to get permission data from hidden protected objects</param>
        /// <returns></returns>
        Task<PermissionedObjectDto> GetAsync(string objectName, string objectType = null, bool useInherited = true, bool useHidden = false);

        Task<PermissionedObjectDto> GetAsync(Guid id, bool useInherited = true, bool useHidden = false);

        Task<PermissionedObjectDto> CopyAsync(string srcObjectName, string dstObjectName, string srcObjectType = null, string dstObjectType = null);

        /// <summary>
        /// Get Protected Object by object name
        /// </summary>
        /// <param name="objectName">Object name for search Protected Object (usually it has format "type@action")</param>
        /// <param name="objectType">Object type for search Protected Object</param>
        /// <param name="useInherited">Get permission data from parent if inherited</param>
        /// <param name="useHidden">Allow to get permission data from hidden protected objects</param>
        /// <returns></returns>
        PermissionedObjectDto Get(string objectName, string objectType = null, bool useInherited = true, bool useHidden = false);

        List<string> GetActualPermissions(string objectName, string objectType = null, bool useInherited = true);

        /// <summary>
        /// Set Protected Object data (save to DB and cache)
        /// </summary>
        /// <param name="permissionedObject">Protected Object data</param>
        /// <returns></returns>
        Task<PermissionedObjectDto> SetAsync(PermissionedObjectDto permissionedObject);

        /// <summary>
        /// Set permission data for Protected Object by object name
        /// </summary>
        /// <param name="objectName">Object name for search Protected Object (usually it has format "type@action")</param>
        /// <param name="access">Get permission data from the parent Protected Object if value is Inherited</param>
        /// <param name="permissions">Required permissions for Protected Object. Will be ignored if Inherited is True</param>
        /// <returns></returns>
        Task<PermissionedObjectDto> SetPermissionsAsync(string objectName, RefListPermissionedAccess access, List<string> permissions);

        /// <summary>
        /// Checks if the action descriptor is not disabled as permissioned object 
        /// </summary>
        /// <param name="actionDescriptor">Action descriptor</param>
        /// <returns></returns>
        Task<bool> IsActionDescriptorEnabled(ActionDescriptor actionDescriptor);
    }
}