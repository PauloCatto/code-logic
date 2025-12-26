import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  showSuccess(levelId: string) {
    return Swal.fire({
      title: 'MUITO BEM!',
      text: `Você completou a fase ${levelId}! Próximo desafio?`,
      icon: 'success',
      confirmButtonText: 'VAMOS LÁ! 🚀',
      showCancelButton: true,
      cancelButtonText: 'REPETIR 🔄',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#3b82f6',
      heightAuto: false,
      customClass: {
        popup: 'rounded-[40px] border-8 border-emerald-500 font-sans',
        title: 'text-emerald-700 font-black',
      },
    });
  }

  showError(message: string = 'O robô bateu em um obstáculo!') {
    return Swal.fire({
      title: 'Ops!',
      text: message,
      icon: 'error',
      confirmButtonText: 'TENTAR DE NOVO 🧠',
      confirmButtonColor: '#ef4444',
      heightAuto: false,
      customClass: {
        popup: 'rounded-[40px] border-8 border-rose-500 font-sans',
      },
    });
  }
}
