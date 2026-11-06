import { computed, inject } from '@angular/core';

import {
  signalStore,
  withComputed,
  withMethods,
  patchState,
  withState
} from '@ngrx/signals';

import {
  withEntities,
  setAllEntities,
  updateEntity
} from '@ngrx/signals/entities';

import { rxMethod } from '@ngrx/signals/rxjs-interop';

import {
  pipe,
  concatMap,
  tap,
  catchError,
  EMPTY,
  switchMap
} from 'rxjs';

import { MedicineService } from '../services/medicine.service';
import { Medicine } from '../models/medicine.models';
import { LiveSyncService } from '../services/live-sync.service';

export interface MedicineState {
  isLoading: boolean;
  error: string | null;

  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

const initialState: MedicineState = {
  isLoading: false,
  error: null,

  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0
};

export const MedicineStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withEntities<Medicine>(),

  withComputed((store: any) => ({
    lowStockCount: computed(() => {
      const entities = store.entities() as Medicine[];

      return entities.filter(
        (medicine: Medicine) =>
          medicine.status === 'LowStock' ||
          medicine.status === 'OutOfStock'
      ).length;
    })
  })),

  withMethods((store: any) => {
    const api = inject(MedicineService);
    const sync = inject(LiveSyncService);

    return {
      loadMedicines: rxMethod<{
        page?: number;
        pageSize?: number;
        searchTerm?: string;
      }>(
        pipe(
          tap(() => {
            patchState(store, {
              isLoading: true,
              error: null
            });
          }),

          concatMap((request) => {
            const page = request?.page ?? 1;
            const pageSize = request?.pageSize ?? 10;
            const searchTerm = request?.searchTerm ?? '';

            return api.getAll(
              page,
              pageSize,
              searchTerm
            ).pipe(

              tap((result) => {

                // Update medicine entities
                patchState(
                  store,
                  setAllEntities(result.items)
                );

                // Update pagination/loading state
                patchState(store, {
                  currentPage: result.page,
                  pageSize: result.pageSize,
                  totalCount: result.totalCount,
                  totalPages: result.totalPages,
                  isLoading: false
                });
              }),

              catchError((err) => {
                patchState(store, {
                  isLoading: false,
                  error:
                    err?.message ||
                    err?.error?.message ||
                    'Fetch failed'
                });

                return EMPTY;
              })
            );
          })
        )
      ),

      listenForLiveStockUpdates: rxMethod<void>(
        pipe(

          tap(() => {
            sync.connect();
          }),

          switchMap(() => sync.events$),

          tap((event: any) => {
            if (!event) {
              return;
            }

            patchState(
              store,

              updateEntity(
                {
                  id: event.medicineId,

                  changes: {
                    quantity: event.newQuantity,
                    status: event.newStatus
                  }
                },

                {
                  collection: 'entities'
                }
              )
            );
          })
        )
      )
    };
  })
);
