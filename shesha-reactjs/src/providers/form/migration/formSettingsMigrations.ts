import { Migrator } from "@/utils/fluentMigrator/migrator";
import { IFormDto, IFormSettings } from "../models";
import { migrateFormApi } from "@/designer-components/_common-migrations/migrateFormApi1";
import { migrateFormLifecycle } from "@/designer-components/_common-migrations/migrateFormLifecycle";
import { migrateDefaultApiEndpoints } from "@/designer-components/_common-migrations/migrateDefaultApiEndpoints";
import { migrateFieldsToFetchAndOnDataLoad } from "@/designer-components/_common-migrations/migrateFieldsToFetchAndOnDataLoad";
import { migrateGqlCustomEndpoint } from "@/designer-components/_common-migrations/migrateGqlCustomEndpoint";

const formSettingsMigrations = (migrator: Migrator<IFormSettings, IFormSettings>) =>
  migrator
    .add(1, (prev) => ({
      ...prev,
      onDataLoaded: migrateFormApi.withoutFormData(prev.onUpdate),
      onInitialized: migrateFormApi.withoutFormData(prev.onInitialized),
      onUpdate: migrateFormApi.withoutFormData(prev.onUpdate),
    }))
    .add(2, (prev) => migrateFormLifecycle(prev))
    .add(3, (prev) => ({ ...prev, onValuesUpdate: prev.onValuesUpdate ?? prev['onValuesChanged'] }))
    .add(4, (prev) => migrateDefaultApiEndpoints(prev))
    .add(5, (prev) => migrateFieldsToFetchAndOnDataLoad(prev))
    .add(6, (prev) => migrateGqlCustomEndpoint(prev))
  ;

export const migrateFormSettings = (form: IFormDto) => {
  if (!form) return form;
  const migrator = new Migrator<IFormSettings, IFormSettings>();
  const fluent = formSettingsMigrations(migrator);
  if (!form.settings?.version) {
    if (!form.settings)
      form.settings = {} as IFormSettings;
    form.settings.version = -1;
  }
  return { ...form, settings: fluent.migrator.upgrade(form.settings, {}) };
};

export const migrateFormSettings2 = (formSettings: IFormSettings) => {
  if (!formSettings)
    return formSettings;

  const migrator = new Migrator<IFormSettings, IFormSettings>();
  const fluent = formSettingsMigrations(migrator);
  if (!formSettings?.version) {
    if (!formSettings)
      formSettings = {} as IFormSettings;
    formSettings.version = -1;
  }
  return fluent.migrator.upgrade(formSettings, {});
};