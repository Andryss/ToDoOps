package ru.andart.todoops.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import ru.andart.todoops.BaseDbTest;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Base class for API tests with MockMvc and embedded database.
 */
@AutoConfigureMockMvc
public abstract class BaseApiTest extends BaseDbTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    protected static final MediaType APPLICATION_JSON = MediaType.APPLICATION_JSON;
}
