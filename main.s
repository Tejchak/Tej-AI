.global main

.text

main:
    push %rbp
    mov %rsp, %rbp
    
    # Align stack to 16 bytes before calls
    push %r12
    push %r13
    push %r14
    # Ensure 16-byte alignment for function calls
    sub $8, %rsp  # Adjust stack to maintain alignment

    cmp $3, %rdi  # check number of arguments
    jne print_error

    mov %rsi, %r12        # Save argv pointer
    
    # Convert first argument
    mov 16(%r12), %rdi    # argv[1]
    call atol
    mov %rax, %r12        # Save first number
    
    # Convert second argument
    mov 24(%r12), %rdi    # argv[2]
    call atol
    mov %rax, %r13        # Save second number

    mov %r12, %rdi        # First argument for crunch
    mov %r13, %rsi        # Second argument for crunch
    call crunch
    mov %rax, %r14        # Save result

    cmp $0, %r14
    jl hat                # hat if negative 
    je tea                # tea if zero
    jg beer              # beer if positive

hat:
    mov $hat_msg, %rdi
    jmp print

tea:
    mov $tea_msg, %rdi
    jmp print

beer:
    mov $beer_msg, %rdi
    jmp print

print_error:
    mov $error_msg, %rdi
    xor %al, %al         # Clear AL register (same as mov $0, %al)
    call printf
    mov $1, %rax
    jmp exit

print:
    xor %al, %al         # Clear AL register
    call printf
    xor %rax, %rax       # Return 0

exit:
    add $8, %rsp         # Restore stack alignment
    pop %r14
    pop %r13
    pop %r12
    leave
    ret

.data
error_msg:
    .asciz "Two arguments required\n"
hat_msg:
    .asciz "hat\n"
tea_msg:
    .asciz "tea\n"
beer_msg:
    .asciz "beer\n"
