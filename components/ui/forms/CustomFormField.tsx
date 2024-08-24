"use client"

import { Control, Controller, Form } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormFieldType } from "./Patientform";
import Image from "next/image";
import PhoneInput from "react-phone-number-input";
import 'react-phone-number-input/style.css';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { Select, SelectTrigger, SelectValue, SelectContent } from "../select";
import { Textarea } from "../textarea";
import { Checkbox } from "../checkbox";

interface CustomProps {
    control: Control<any>,
    fieldType: FormFieldType,
    name: string,
    label?: string,
    placeholder?: string,
    iconSrc?: string,
    iconAlt?: string,
    disabled?: boolean,
    dateFormat?: string,
    showTimeSelect?: boolean,
    children?: React.ReactNode,
    renderSkeleton?: (field: any) => React.ReactNode,
}

const RenderField = ({ field, props }: { field: any; props: CustomProps }) => {
    const { fieldType, iconSrc, iconAlt, placeholder, showTimeSelect, dateFormat, renderSkeleton } = props;
    switch (fieldType) {
        case FormFieldType.INPUT:
            return (
                <div className="flex rounded-md border border-dark-500 bg-dark-400">
                    {iconSrc && (
                        <Image
                            src={iconSrc}
                            height={24}
                            width={24}
                            alt={iconAlt || 'icon'}
                            className="ml-2"
                        />
                    )}
                    <FormControl>
                        <Input
                            placeholder={placeholder}
                            {...field}
                            className="shad-input border-0"
                        />
                    </FormControl>
                </div>
            );
            

            case FormFieldType.TEXTAREA:
                return(
                    <FormControl>
                         <Textarea placeholder={placeholder} {...field}
                         className="shad-textArea"
                         disabled={props.disabled}
                         />
                    </FormControl>
                )

            case FormFieldType.PHONE_INPUT:
            return (
                <FormControl>
                    <PhoneInput
                        placeholder={placeholder}
                        defaultCountry="US"
                        international
                        withCountryCallingCode
                        value={field.value}
                        onChange={field.onChange}
                        className="Input-phone shad-input border-0"
                    />
                </FormControl>
            );

            case FormFieldType.DATE_PICKER:
                return (
                  <div className="flex rounded-md border border-dark-500 bg-dark-400">
                    <Image
                      src="/assets/icons/calendar.svg"
                      height={24}
                      width={24}
                      alt="user"
                      className="ml-2"
                    />
                    <FormControl>
                    <DatePicker selected={field.value}
                     onChange={(date)=> field.onChange(date)}
                     dateFormat={dateFormat ?? 'MM/dd/yyyy'}
                     showTimeSelect={showTimeSelect ?? false}
                     timeInputLabel="Time:"
                     wrapperClassName="date-picker"
                     />
                    </FormControl>
                  </div>
                )

                case FormFieldType.SKELETON:
                    return(
                        renderSkeleton ? renderSkeleton
                        (field): null
                    )
                case FormFieldType.SELECT:
                    return(
                        <FormControl>
                            <Select onValueChange={field.onChange} 
                            defaultValue={field.value}>
                            <FormControl >
                           <SelectTrigger
                            className="shad-select-trigger">
                           <SelectValue 
                           placeholder={placeholder}/>
                           </SelectTrigger>
                            </FormControl>
                            <SelectContent className="shad-select-content">
                                {props.children}
                            </SelectContent>
                            </Select>
                        </FormControl>
                    )
                    case FormFieldType.CHECKBOX:
                        return(
                            <FormControl>
                                <div className="flex items-center gap-4">
                                    <Checkbox
                                    id={props.name}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                    <label htmlFor={props.name} className="checkbox-label">
                                        {props.label}

                                    </label>
                                </div>
                            </FormControl>
                   )
        default:
            return null;
    }
}

const CustomFormField = (props: CustomProps) => {
    const { control, fieldType, name, label } = props;
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex-1">
                    {fieldType !== FormFieldType.CHECKBOX && label && (
                        <FormLabel>{label}</FormLabel>
                    )}
                    <RenderField field={field} props={props} />
                    <FormMessage className="shad-error" />
                </FormItem>
            )}
        />
    );
};

export default CustomFormField;