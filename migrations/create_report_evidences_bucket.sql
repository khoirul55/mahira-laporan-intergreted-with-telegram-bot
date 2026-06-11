-- 1. Buat bucket baru bernama 'report_evidences' (bersifat private)
insert into storage.buckets (id, name, public)
values ('report_evidences', 'report_evidences', false)
on conflict (id) do nothing;

-- 2. Buat Policy agar pengguna yang sudah login (authenticated) bisa mengunggah file (INSERT)
create policy "Allow authenticated users to insert report_evidences"
on storage.objects for insert to authenticated
with check ( bucket_id = 'report_evidences' );

-- 3. Buat Policy agar pengguna yang sudah login bisa membaca/melihat file (SELECT)
create policy "Allow authenticated users to select report_evidences"
on storage.objects for select to authenticated
using ( bucket_id = 'report_evidences' );

-- 4. Buat Policy agar pengguna bisa menghapus file yang mereka unggah sendiri (DELETE)
create policy "Allow users to delete their own report_evidences"
on storage.objects for delete to authenticated
using ( bucket_id = 'report_evidences' and auth.uid() = owner );
