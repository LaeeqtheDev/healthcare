"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {Form} from "@/components/ui/form"
import CustomFormField from "./CustomFormField"
import SubmitButton from "@/components/SubmitButton"
import {useState} from 'react'
import { UserFormValidation } from "@/lib/validation"

export enum FormFieldType {
    INPUT ='input',
    TEXTAREA= 'textaea',
    PHONE_INPUT = 'phoneInput',
    CHECKBOX = 'checkbox',
    DATE_PICKER = 'datePicker',
    SELECT = 'select',
    SKELETON = 'sekeleton',
}
 

 
const Patientform=() =>{
  // 1. Define your form.
    const [isLoading, setIsloading]= useState(false)

  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  })
 
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof UserFormValidation>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <section className="mb-12 space-y-4">
            <h1 className="header">
            Hi there👋
            </h1>
            <p className="text-dark-700">
             Schedule your first appointment.
            </p>
        </section>

        <CustomFormField control={form.control} 
        fieldType={FormFieldType.INPUT}
        name="name"
        placeholder="john doe"
        iconSrc="/assets/icons/user.svg"
        iconAlt="user"
        label="Fullname"
        
        />
         <CustomFormField control={form.control} 
        fieldType={FormFieldType.INPUT}
        name="email"
        label="Email"
        placeholder="someone@example.com"
        iconSrc="/assets/icons/email.svg"
        iconAlt="email"
     
        
        />
          <CustomFormField control={form.control} 
        fieldType={FormFieldType.PHONE_INPUT}
        name="phone"
        label="Phone number"
        placeholder="(555) 12-4567"
    
        
        />



       <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
      </form>
    </Form>
  )
}

export default Patientform