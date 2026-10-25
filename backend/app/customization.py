import base64
import binascii
from typing import Annotated, Literal

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, model_validator


def validate_image(value: str) -> str:
    if value in ("/images/aurora.webp", "/images/sunset.webp", "/images/confetti.webp"):
        return value
    try:
        header, encoded = value.split(",", 1)
        content = base64.b64decode(encoded, validate=True)
    except (ValueError, binascii.Error) as error:
        raise ValueError("Invalid image data") from error
    signatures = {
        "data:image/png;base64": content.startswith(b"\x89PNG\r\n\x1a\n"),
        "data:image/jpeg;base64": content.startswith(b"\xff\xd8\xff"),
        "data:image/webp;base64": content[:4] == b"RIFF" and content[8:12] == b"WEBP",
    }
    if not signatures.get(header, False) or len(content) > 512_000:
        raise ValueError("Expected PNG/JPEG/WebP up to 512 KB")
    return value


Image = Annotated[str, Field(max_length=683_000), AfterValidator(validate_image)]
Color = Annotated[str, Field(pattern=r"^#[0-9a-fA-F]{6}$")]


class PaletteColor(BaseModel):
    model_config = ConfigDict(extra="forbid")
    color: Color
    enabled: bool = True


class Customization(BaseModel):
    model_config = ConfigDict(extra="forbid")
    version: Literal[1] = 1
    spin_sound: Literal[
        "none", "ticking", "drum", "pulse", "woodblock", "shaker", "heartbeat", "arpeggio", "space"
    ] = "ticking"
    spin_volume: int = Field(default=50, ge=0, le=100)
    show_duplicates: bool = True
    slow_spin: bool = False
    show_title: bool = True
    duration: int = Field(default=10, ge=1, le=60)
    max_names: int = Field(default=1000, ge=4, le=1000)
    result_sound: Literal[
        "none", "applause", "chime", "fanfare", "victory", "magic", "bell", "arcade", "gong"
    ] = "applause"
    result_volume: int = Field(default=50, ge=0, le=100)
    animate_winner: bool = False
    confetti: bool = True
    auto_remove: bool = False
    popup: bool = True
    popup_message: str = Field(default="And The Winner is...", min_length=1, max_length=200)
    remove_button: bool = True
    removal_sound: bool = False
    mode: Literal["colors", "image"] = "colors"
    palette: list[PaletteColor] = Field(default_factory=lambda: [
        PaletteColor(color=color)
        for color in ("#ded2f6", "#f6d5c4", "#cbe5dc", "#f4e6b7", "#cddff2", "#edcfe1")
    ], min_length=1, max_length=12)
    center_image: Image | None = None
    center_size: Literal["XS", "S", "M", "L", "XL", "XXL"] = "S"
    wheel_image: Image | None = None
    pointer_changes: bool = True
    pointer_color: Color = "#7650cc"
    page_color: Color = "#f8f7fc"
    gradient: bool = True
    text: Literal["always", "never", "unless_image"] = "always"
    borders: bool = False
    shadow: bool = True

    @model_validator(mode="after")
    def enabled_color(self):
        if not any(color.enabled for color in self.palette):
            raise ValueError("At least one palette color must remain enabled")
        return self
