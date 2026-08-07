<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterResidentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'full_name'           => ['required', 'string', 'min:2', 'max:100', 'regex:/^[a-zA-Z\s\.\-\']+$/'],
            'gender'              => ['required', 'in:Male,Female,Prefer not to say'],
            'date_of_birth'       => ['required', 'date', 'before_or_equal:today', 'before:-15 years', 'after:-120 years'],
            'civil_status'        => ['required', 'in:Single,Married,Widowed,Separated'],
            'address'             => ['required', 'string', 'min:5', 'max:250'],
            'zone_purok'          => ['required', 'string'],
            'mobile_number'       => ['required', 'regex:/^09\d{9}$/'],
            'email'               => ['required', 'email:rfc,dns', 'unique:users,email'],
            'password'            => ['required', 'string', 'min:8', 'regex:/[a-z]/', 'regex:/[A-Z]/', 'regex:/[0-9]/'],
            'id_type'             => ['required', 'string'],
            'id_reference_number' => ['required', 'string', 'min:5', 'max:30', 'alpha_num'],
        ];
    }
}
