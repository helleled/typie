<script lang="ts" module>
  import ky from 'ky';
  import { graphql } from '$graphql';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { systemInfo } from '$lib/system-info';
  import { get } from 'svelte/store';

  const issueBlobUploadUrl = graphql(`
    mutation BlobUtils_IssueBlobUploadUrl($input: IssueBlobUploadUrlInput!) {
      issueBlobUploadUrl(input: $input) {
        path
        url
        fields
      }
    }
  `);

  const persistBlobAsFile = graphql(`
    mutation BlobUtils_PersistBlobAsFile($input: PersistBlobAsFileInput!) {
      persistBlobAsFile(input: $input) {
        id
        name
        size
        url
      }
    }
  `);

  const persistBlobAsImage = graphql(`
    mutation BlobUtils_PersistBlobAsImage($input: PersistBlobAsImageInput!) {
      persistBlobAsImage(input: $input) {
        id
        url
        size
        ...Img_image
      }
    }
  `);

  export const uploadBlob = async (file: File) => {
    const systemInfoValue = get(systemInfo);
    
    if (systemInfoValue.offlineMode) {
      // Use local storage endpoint in offline mode
      const key = `uploads/${Date.now()}-${file.name}`;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', key);
      formData.append('filename', file.name);

      const response = await ky.post(`${PUBLIC_API_URL}/storage/uploads/upload`, {
        body: formData,
        timeout: false,
      }).json<{ success: boolean; key: string }>();

      return response.key;
    } else {
      // Use regular S3 upload in online mode
      const { path, url, fields } = await issueBlobUploadUrl({ filename: file.name });

      const formData = new FormData();
      for (const [key, value] of Object.entries<string>(fields)) {
        formData.append(key, value);
      }

      formData.append('Content-Type', file.type);
      formData.append('file', file);

      await ky.post(url, {
        body: formData,
        timeout: false,
      });

      return path;
    }
  };

  export const uploadBlobAsFile = async (file: File) => {
    const path = await uploadBlob(file);
    return await persistBlobAsFile({ path });
  };

  export const uploadBlobAsImage = async (file: File, modification?: unknown) => {
    const path = await uploadBlob(file);
    return await persistBlobAsImage({ path, modification });
  };
</script>
