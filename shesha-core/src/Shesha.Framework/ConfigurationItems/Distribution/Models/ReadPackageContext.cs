﻿using Abp.Dependency;
using Abp.Reflection;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.ConfigurationItems.Distribution.Models
{
    /// <summary>
    /// Read package context
    /// </summary>
    public class ReadPackageContext
    {
        /// <summary>
        /// If true, indicates that unsupported items (the ones which have no corresponding importer) should be skipped, otherwise an exception should be thrown.
        /// </summary>
        public bool SkipUnsupportedItems { get; set; }

        private readonly IIocManager _iocManager;

        private readonly Dictionary<string, IConfigurableItemImport> _importers = new Dictionary<string, IConfigurableItemImport>();
        private readonly Dictionary<string, Type> _itemTypes = new Dictionary<string, Type>();

        public IConfigurableItemImport GetImporter(string itemType) 
        {
            if (_importers.TryGetValue(itemType, out var importer))
                return importer;

            
            importer = _itemTypes.TryGetValue(itemType, out var entityType)
                ? _iocManager.GetItemImporter(entityType)
                : null;
            _importers[itemType] = importer;

            return importer;
        }

        public ReadPackageContext(IIocManager iocManager)
        {
            _iocManager = iocManager;

            var typeFinder = iocManager.Resolve<ITypeFinder>();
            var entityConfigStore = iocManager.Resolve<IEntityConfigurationStore>();

            var types = typeFinder.Find(t => t.IsAssignableTo(typeof(ConfigurationItemBase)) && !t.IsAbstract).ToList();
            _itemTypes = types.ToDictionary(t => entityConfigStore.Get(t).DiscriminatorValue.Trim('"', '\'').Replace("N'", ""), t => t);
        }

        public ReadPackageContext() : this(StaticContext.IocManager)
        {
        }
    }
}
