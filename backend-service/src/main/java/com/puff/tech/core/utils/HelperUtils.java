package com.puff.tech.core.utils;

import io.micronaut.http.multipart.CompletedFileUpload;
import jakarta.inject.Singleton;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

@Singleton
public class HelperUtils {
    public String uploadFile(CompletedFileUpload fileUpload) throws IOException {

            String path= "uploads/"+fileUpload.getFilename();
            File dest= new File(path);
            Files.write(dest.toPath(),fileUpload.getBytes());
            return path;
    }

    public void deleteFile(String path){
        File file= new File(path);
        if(file.exists()){
            file.delete();
        }
    }
}
