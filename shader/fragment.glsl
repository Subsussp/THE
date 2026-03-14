#version 330 core

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoord;

uniform sampler2D texture1;
uniform vec3 viewPos;

out vec4 FragColor;

void main()
{
    vec4 texColor = texture(texture1, TexCoord);
    FragColor = texColor;
}