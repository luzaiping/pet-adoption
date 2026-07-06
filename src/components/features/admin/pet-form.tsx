'use client';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  CreatePetForm,
  UpdatePetForm,
  createPetSchema,
  updatePetSchema,
} from '@/schemas/pets';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';

import {
  updatePetAction,
  createPetAction,
  PetActionResult,
} from '@/actions/admin/pets';
import { Mode } from '@/lib/constants/pets';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { PetGender, PetStatus } from '@prisma/client';
import { PetImagePicker } from '@/components/features/pets/pet-image-picker';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type Props = {
  mode: Mode;
  defaultValues: CreatePetForm | UpdatePetForm;
  shelterList: { id: string; name: string }[];
  speciesList: string[];
};

function RequiredFieldLabel({
  children,
  ...props
}: React.ComponentProps<typeof FieldLabel>) {
  return (
    <FieldLabel {...props}>
      {children}
      <span className="text-destructive" aria-hidden="true">
        *
      </span>
      <span className="sr-only"> (required)</span>
    </FieldLabel>
  );
}

export function PetForm({
  mode,
  defaultValues,
  shelterList,
  speciesList,
}: Props) {
  const router = useRouter();
  const isEditMode = mode === Mode.Edit;
  const formSchema = isEditMode ? updatePetSchema : createPetSchema;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const species = useWatch({ control: form.control, name: 'species' });

  async function onSubmit(values: UpdatePetForm | CreatePetForm) {
    let result: PetActionResult;
    if (mode === Mode.Create) {
      result = await createPetAction(values as CreatePetForm);
    } else {
      result = await updatePetAction(values as UpdatePetForm);
    }
    
    if (!result.success) {
      if (result.fieldErrors) {
        for (const [fieldName, errors] of Object.entries(
          result.fieldErrors,
        ) as [keyof UpdatePetForm, string[]][]) {
          const message = errors[0];

          if (message) {
            form.setError(
              fieldName as Parameters<typeof form.setError>[0],
              { type: 'server', message },
            );
          }
        }
      }

      if (result.message) {
        form.setError('root', { message: result.message, type: 'server' });
      }

      return;
    }

    toast.success(
      isEditMode
        ? `${values.name} was updated successfully.`
        : `${values.name} was created successfully.`,
    );
    router.push('/dashboard/admin/pets');
  }

  return (
    <Card className="w-full overflow-hidden border-border/80 shadow-sm">
      <CardHeader className="border-b bg-muted/20 px-6 py-5 sm:px-8">
        <CardTitle className="text-xl">Pet details</CardTitle>
        <p className="text-sm text-muted-foreground">
          Fields marked with <span className="text-destructive">*</span> are
          required.
        </p>
      </CardHeader>
      <CardContent className="px-6 py-7 sm:px-8">
        <form id="pet-form" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <RequiredFieldLabel htmlFor="pet-name">
                        Name
                      </RequiredFieldLabel>
                      <Input
                        {...field}
                        id="pet-name"
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. Luna"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="species"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <RequiredFieldLabel htmlFor="pet-species">
                        Species
                      </RequiredFieldLabel>
                      <Combobox
                        items={speciesList}
                        value={field.value || null}
                        inputValue={field.value}
                        onInputValueChange={(value) => field.onChange(value)}
                        onValueChange={(value) => field.onChange(value ?? '')}
                      >
                        <ComboboxInput
                          id="pet-species"
                          ref={field.ref}
                          onBlur={field.onBlur}
                          placeholder="Select or enter a species"
                          aria-invalid={fieldState.invalid}
                          className="w-full"
                          showClear
                        />
                        <ComboboxContent>
                          <ComboboxEmpty>
                            Enter a new species to add it.
                          </ComboboxEmpty>
                          <ComboboxList>
                            {speciesList.map((species) => (
                              <ComboboxItem key={species} value={species}>
                                {species}
                              </ComboboxItem>
                            ))}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                      <FieldDescription>
                        Select an existing species or enter a new one.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="breed"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="pet-breed">Breed</FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        id="pet-breed"
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. Labrador Retriever"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
            <Controller
              name="age"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="pet-age">Age</FieldLabel>
                  <Input
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    value={
                      typeof field.value === 'string' ||
                      typeof field.value === 'number'
                        ? field.value
                        : ''
                    }
                    id="pet-age"
                    type="number"
                    min={0}
                    max={20}
                    step={1}
                    inputMode="numeric"
                    aria-invalid={fieldState.invalid}
                    placeholder="Age in years"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="gender"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="pet-gender">Gender</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="pet-gender"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                    >
                      <SelectValue placeholder="Select a gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PetGender.MALE}>Male</SelectItem>
                      <SelectItem value={PetGender.FEMALE}>Female</SelectItem>
                      <SelectItem value={PetGender.UNKNOWN}>Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="shelterId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                      <RequiredFieldLabel htmlFor="pet-shelter">
                        Shelter
                      </RequiredFieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="pet-shelter"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                    >
                      <SelectValue placeholder="Select a shelter" />
                    </SelectTrigger>
                    <SelectContent>
                      {shelterList.map((shelter) => (
                        <SelectItem key={shelter.id} value={shelter.id}>
                          {shelter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {isEditMode && (
              <Controller
                name={'status' as Parameters<typeof form.setValue>[0]}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <RequiredFieldLabel htmlFor="pet-status">
                      Status
                    </RequiredFieldLabel>
                    <Select
                      value={field.value as PetStatus}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="pet-status"
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                        onBlur={field.onBlur}
                      >
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PetStatus.AVAILABLE}>
                          Available
                        </SelectItem>
                        <SelectItem value={PetStatus.ADOPTED}>
                          Adopted
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}
              </div>
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="pet-description">Description</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      value={field.value ?? ''}
                      id="pet-description"
                      placeholder="Describe the pet's personality and needs."
                      rows={6}
                      className="min-h-24 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {field.value?.length ?? 0}/500 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Add useful details for potential adopters.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            </FieldGroup>

            <Controller
              name="image"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="lg:sticky lg:top-24"
                >
                  <div className="space-y-1">
                    <RequiredFieldLabel>Profile image</RequiredFieldLabel>
                    <FieldDescription>
                      The primary image shown throughout the adoption catalog.
                    </FieldDescription>
                  </div>
                  <PetImagePicker
                    species={species}
                    value={field.value}
                    onChange={field.onChange}
                    invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {form.formState.errors.root && (
            <Field data-invalid>
              <FieldError errors={[form.formState.errors.root]} />
            </Field>
          )}
        </form>
      </CardContent>
      <CardFooter className="justify-end border-t bg-muted/20 px-6 py-5 sm:px-8">
        <Field orientation="horizontal" className="flex-none">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button
            type="submit"
            form="pet-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? 'Saving...'
              : isEditMode
                ? 'Save changes'
                : 'Create pet'}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
